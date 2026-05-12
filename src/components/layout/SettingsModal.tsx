import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { PRESET_MODELS } from '../../types'
import type { ApiSettings } from '../../types'
import Modal from '../ui/Modal'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useStore()
  const [localSettings, setLocalSettings] = useState<ApiSettings>(settings)
  const [selectedPreset, setSelectedPreset] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings, open])

  const handlePresetChange = (presetLabel: string) => {
    setSelectedPreset(presetLabel)
    const preset = PRESET_MODELS.find((p) => p.label === presetLabel)
    if (preset && preset.label !== 'Custom') {
      const updated = {
        ...localSettings,
        apiUrl: preset.apiUrl,
        model: preset.value,
      }
      setLocalSettings(updated)
    }
  }

  const handleSave = () => {
    updateSettings(localSettings)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="API Settings" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Model preset */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Quick Preset</label>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="">Select a preset...</option>
            {PRESET_MODELS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* API URL */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">API URL</label>
          <input
            type="text"
            value={localSettings.apiUrl}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, apiUrl: e.target.value })
            }
            placeholder="https://api.deepseek.com/v1/chat/completions"
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <p className="mt-1 text-xs text-muted">
            OpenAI-compatible endpoint URL
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={localSettings.apiKey}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, apiKey: e.target.value })
              }
              placeholder="sk-..."
              className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 pr-10 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink transition-colors"
            >
              {showApiKey ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Model name */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Model Name</label>
          <input
            type="text"
            value={localSettings.model}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, model: e.target.value })
            }
            placeholder="deepseek-chat"
            className="w-full rounded-lg border border-hairline bg-canvas px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Model capability note */}
        <div className="rounded-lg bg-surface-card px-4 py-3">
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-body">Image support:</strong>{' '}
            {['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'claude-3', 'gemini'].some((m) =>
              localSettings.model.toLowerCase().includes(m)
            )
              ? 'Your current model supports image input.'
              : 'Your current model likely does NOT support image input. You can still send images, but the API may reject them.'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-hairline bg-canvas px-5 py-2.5 text-sm font-medium text-body hover:bg-surface-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-active transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
