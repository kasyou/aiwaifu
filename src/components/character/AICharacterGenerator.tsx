import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { generateCharacter } from '../../utils/api'
import { generateEmojiAvatar } from '../../utils/avatar'
import Modal from '../ui/Modal'
import type { Character } from '../../types'

interface AICharGenProps {
  open: boolean
  onClose: () => void
}

function generateId(): string {
  return `char-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function AICharacterGenerator({ open, onClose }: AICharGenProps) {
  const { settings, addCharacter } = useStore()
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    const trimmed = description.trim()
    if (!trimmed) {
      setError('请输入角色描述。')
      return
    }
    if (!settings.apiKey) {
      setError('请先在设置中配置 API Key。')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const result = await generateCharacter(settings, trimmed)
      const avatar = generateEmojiAvatar(result.avatarEmoji)
      const newChar: Character = {
        id: generateId(),
        name: result.name,
        systemPrompt: result.systemPrompt,
        avatar,
        isPreset: false,
        createdAt: Date.now(),
      }
      addCharacter(newChar)
      setDescription('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试。')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="AI 生成角色">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            描述你想要的角色
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={'例如："我想和《原神》里的胡桃聊天，她调皮爱捉弄人，喜欢作诗..."'}
            rows={5}
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-vertical"
          />
          <p className="mt-1 text-xs text-muted">
            描述角色的性格、背景、来源作品，以及你希望他们在对话中如何表现。
          </p>
        </div>

        {!settings.apiKey && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            需要先在设置中配置 API Key 才能生成角色。
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-body hover:bg-surface-card transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !settings.apiKey}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" className="opacity-30" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="15.7" strokeLinecap="round" className="opacity-80" strokeDashoffset="31.4" />
                </svg>
                生成中...
              </>
            ) : (
              '生成'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
