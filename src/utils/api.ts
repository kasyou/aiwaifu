import type { ApiSettings, ChatMessage, OpenAIContentPart } from '../types'
import { supportsVision } from '../types'

interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: Error) => void
}

export async function streamChat(
  settings: ApiSettings,
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string; images?: string[] }[],
  callbacks: StreamCallbacks
): Promise<void> {
  const { apiUrl, apiKey, model } = settings

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ]

  for (const msg of messages) {
    if (msg.images && msg.images.length > 0 && supportsVision(model)) {
      const parts: OpenAIContentPart[] = [
        ...msg.images.map((url): OpenAIContentPart => ({
          type: 'image_url',
          image_url: { url, detail: 'low' },
        })),
        { type: 'text', text: msg.content },
      ]
      chatMessages.push({ role: msg.role, content: parts })
    } else {
      chatMessages.push({ role: msg.role, content: msg.content })
    }
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorMsg: string
      try {
        const err = JSON.parse(errorText)
        errorMsg = err.error?.message || err.message || errorText
      } catch {
        errorMsg = errorText || `HTTP ${response.status}`
      }
      throw new Error(errorMsg)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          callbacks.onDone()
          return
        }
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            callbacks.onToken(content)
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    callbacks.onDone()
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

const CHARACTER_GEN_SYSTEM_PROMPT = `You are a character creation assistant for a roleplay chat app. Based on the user's description, generate a character.

Output ONLY valid JSON (no markdown, no code blocks, no extra text) with exactly these fields:
- "name": The character's name
- "systemPrompt": A detailed system prompt defining the character's personality, speech patterns, background, and how they should respond. Write in second person ("You are..."). Make it detailed enough for good roleplay (150-300 words).
- "avatarEmoji": A single emoji that best represents this character (e.g., "🐱" for a cat-like character, "⚔️" for a warrior, "🌸" for a gentle flower girl). Choose the most fitting ONE emoji.`

export async function generateCharacter(
  settings: ApiSettings,
  userDescription: string
): Promise<{ name: string; systemPrompt: string; avatarEmoji: string }> {
  const { apiUrl, apiKey, model } = settings

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: CHARACTER_GEN_SYSTEM_PROMPT },
        { role: 'user', content: userDescription },
      ],
      stream: false,
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    let errorMsg: string
    try {
      const err = JSON.parse(errorText)
      errorMsg = err.error?.message || err.message || errorText
    } catch {
      errorMsg = errorText || `HTTP ${response.status}`
    }
    throw new Error(errorMsg)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('No content in response')
  }

  // Strip markdown code blocks if present
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  const parsed = JSON.parse(jsonStr)
  if (!parsed.name || !parsed.systemPrompt) {
    throw new Error('Generated character missing required fields (name, systemPrompt)')
  }

  return {
    name: parsed.name,
    systemPrompt: parsed.systemPrompt,
    avatarEmoji: parsed.avatarEmoji || '✨',
  }
}
