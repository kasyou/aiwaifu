import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { compressImage, isValidImageType, isValidImageSize } from '../../utils/image'
import { generateSvgAvatar } from '../../utils/avatar'
import Avatar from '../ui/Avatar'
import Modal from '../ui/Modal'
import type { Character } from '../../types'

interface CharacterEditorProps {
  open: boolean
  characterId: string | null
  onClose: () => void
}

function generateId(): string {
  return `char-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function CharacterEditor({ open, characterId, onClose }: CharacterEditorProps) {
  const { characters, addCharacter, updateCharacter } = useStore()
  const existingChar = characterId ? characters.find((c) => c.id === characterId) : null
  const isEditing = !!existingChar

  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (existingChar) {
      setName(existingChar.name)
      setSystemPrompt(existingChar.systemPrompt)
      setAvatar(existingChar.avatar)
    } else {
      setName('')
      setSystemPrompt('')
      setAvatar(undefined)
    }
    setError('')
  }, [open, existingChar])

  const handleAvatarUpload = async (file: File) => {
    if (!isValidImageType(file)) {
      setError('请上传 JPG、PNG、GIF 或 WebP 格式的图片。')
      return
    }
    if (!isValidImageSize(file, 5)) {
      setError('图片大小不能超过 5MB。')
      return
    }
    try {
      const dataUrl = await compressImage(file, 128, 128, 0.7)
      setAvatar(dataUrl)
      setError('')
    } catch {
      setError('图片处理失败。')
    }
  }

  const handleRemoveAvatar = () => {
    // Reset to generated default based on current name
    const defaultAv = generateSvgAvatar(name.trim() || '?')
    setAvatar(defaultAv)
  }

  const handleSubmit = () => {
    const trimmedName = name.trim()
    const trimmedPrompt = systemPrompt.trim()

    if (!trimmedName) {
      setError('角色名称不能为空。')
      return
    }
    if (!trimmedPrompt) {
      setError('角色设定不能为空。')
      return
    }

    if (isEditing && existingChar) {
      updateCharacter(existingChar.id, {
        name: trimmedName,
        systemPrompt: trimmedPrompt,
        avatar,
      })
    } else {
      const defaultAv = generateSvgAvatar(trimmedName)
      const newChar: Character = {
        id: generateId(),
        name: trimmedName,
        systemPrompt: trimmedPrompt,
        avatar: avatar || defaultAv,
        isPreset: false,
        createdAt: Date.now(),
      }
      addCharacter(newChar)
    }
    onClose()
  }

  // Preview the current avatar state
  const isCustomUpload = avatar && avatar.startsWith('data:image/') && !avatar.startsWith('data:image/svg')

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? '编辑角色' : '新建角色'}>
      <div className="space-y-5">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <Avatar avatar={avatar} name={name || '?'} size={20} className="cursor-pointer hover:opacity-80 transition-opacity" />
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-primary hover:text-primary-active transition-colors"
            >
              上传头像
            </button>
            <p className="text-xs text-muted mt-1">JPG、PNG、GIF、WebP，最大 5MB，自动裁剪为 128×128</p>
            {isCustomUpload && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs text-red-500 hover:text-red-600 mt-1 block"
              >
                恢复默认头像
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleAvatarUpload(file)
              e.target.value = ''
            }}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">角色名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="角色名称"
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* System Prompt */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">角色设定 (System Prompt)</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="你是 [角色名]……"
            rows={8}
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-vertical"
          />
          <p className="mt-1 text-xs text-muted">
            定义角色的性格、背景、说话风格。使用第二人称（"你是……"）。
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-body hover:bg-surface-card transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-active transition-colors"
          >
            {isEditing ? '保存修改' : '创建角色'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
