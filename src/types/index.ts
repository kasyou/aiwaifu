export interface Character {
  id: string
  name: string
  systemPrompt: string
  avatar?: string // base64 data URL
  isPreset: boolean
  createdAt: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[] // base64 data URLs
  timestamp: number
}

export interface ApiSettings {
  apiUrl: string
  apiKey: string
  model: string
}

export interface PresetModel {
  label: string
  value: string
  apiUrl: string
}

export const PRESET_MODELS: PresetModel[] = [
  { label: 'DeepSeek V3', value: 'deepseek-chat', apiUrl: 'https://api.deepseek.com/v1/chat/completions' },
  { label: 'OpenAI GPT-4o', value: 'gpt-4o', apiUrl: 'https://api.openai.com/v1/chat/completions' },
  { label: 'OpenAI GPT-4o-mini', value: 'gpt-4o-mini', apiUrl: 'https://api.openai.com/v1/chat/completions' },
  { label: 'OpenAI GPT-4 Turbo', value: 'gpt-4-turbo', apiUrl: 'https://api.openai.com/v1/chat/completions' },
  { label: 'Custom', value: '', apiUrl: '' },
]

export const DEFAULT_API_SETTINGS: ApiSettings = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
}

// Models known to support vision/multimodal input
const MULTIMODAL_MODELS = new Set([
  'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4-vision-preview',
  'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku',
  'claude-3-5-sonnet', 'claude-3-5-haiku',
  'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash',
])

export function supportsVision(model: string): boolean {
  const lower = model.toLowerCase()
  for (const m of MULTIMODAL_MODELS) {
    if (lower.includes(m)) return true
  }
  return false
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | OpenAIContentPart[]
}

export interface OpenAIContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string; detail?: 'low' | 'high' | 'auto' }
}
