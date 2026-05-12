import { useState, useRef, useEffect } from 'react'
import { compressImage, isValidImageType, isValidImageSize } from '../../utils/image'
import { supportsVision } from '../../types'
import { useStore } from '../../store/useStore'

interface ChatInputProps {
  onSend: (text: string, images: string[]) => void
  /** When true, sending is blocked (streaming in progress) but text input stays enabled */
  sendingBlocked: boolean
}

export default function ChatInput({ onSend, sendingBlocked }: ChatInputProps) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageError, setImageError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const settings = useStore((s) => s.settings)

  const modelSupportsVision = supportsVision(settings.model)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [text])

  const handleSend = () => {
    if (sendingBlocked) return
    const trimmed = text.trim()
    if (!trimmed && images.length === 0) return

    onSend(trimmed || '(image)', images)
    setText('')
    setImages([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    // Focus remains naturally since textarea is never disabled
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // During streaming, Enter adds newline so user can compose while waiting
      if (sendingBlocked) return // let default newline behavior happen
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageUpload = async (file: File) => {
    setImageError('')
    if (!isValidImageType(file)) {
      setImageError('只支持 JPG、PNG、GIF、WebP 格式。')
      return
    }
    if (!isValidImageSize(file, 10)) {
      setImageError('图片不能超过 10MB。')
      return
    }
    try {
      const dataUrl = await compressImage(file, 512, 512, 0.7)
      setImages((prev) => [...prev, dataUrl])
    } catch {
      setImageError('图片处理失败。')
    }
  }

  return (
    <div className="border-t border-hairline bg-canvas p-4">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`已上传 ${i + 1}`}
                className="h-16 w-16 rounded-lg object-cover border border-hairline"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image error */}
      {imageError && (
        <div className="mb-2 text-xs text-red-500">{imageError}</div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!modelSupportsVision || sendingBlocked}
          className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
            modelSupportsVision && !sendingBlocked
              ? 'text-muted hover:text-ink hover:bg-surface-card'
              : 'text-muted/40 cursor-not-allowed'
          }`}
          title={
            !modelSupportsVision
              ? '当前模型不支持图片输入'
              : sendingBlocked
              ? '回复中，请稍候'
              : '上传图片'
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
            e.target.value = ''
          }}
          disabled={!modelSupportsVision || sendingBlocked}
          className="hidden"
        />

        {/* Text input — never disabled, focus stays naturally */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            sendingBlocked
              ? 'AI 正在回复…（可提前输入，Enter 换行）'
              : modelSupportsVision
              ? '输入消息…（Enter 发送，Shift+Enter 换行）'
              : '输入消息…（Enter 发送，Shift+Enter 换行）'
          }
          rows={1}
          className="flex-1 resize-none rounded-xl border border-hairline bg-canvas px-4 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />

        {/* Send button — disabled during streaming */}
        <button
          type="button"
          onClick={handleSend}
          disabled={sendingBlocked || (!text.trim() && images.length === 0)}
          className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-active disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {!modelSupportsVision && (
        <p className="mt-1.5 text-xs text-muted">
          当前模型（{settings.model}）不支持图片输入。
        </p>
      )}
    </div>
  )
}
