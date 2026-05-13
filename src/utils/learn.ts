import type { ApiSettings } from '../types'

const LEARN_KEYWORDS = [
  '你应该', '你不要', '你给我', '以后都', '从现在起', '记住',
  '改成', '改变一下', '调整一下', '更正', '学着点',
  '别这么', '别那么', '能不能别', '可以不可以',
  '更温柔', '更热情', '更冷淡', '更傲娇', '更可爱', '更成熟', '更活泼',
  '太冷淡', '太热情', '太温柔', '太凶', '太机械',
  '叫我', '称呼我', '以后叫我',
  '你应该是', '你要像', '学一下', '模仿',
]

// Rate limiting: max 1 learning per character per cooldown period
const learnCooldowns = new Map<string, number>()
const LEARN_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export interface LearnResult {
  trigger: boolean
  newSystemPrompt?: string
}

/** Check if user message contains intent to modify character behavior */
export function detectLearnIntent(message: string): boolean {
  const lower = message.toLowerCase()
  for (const kw of LEARN_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) return true
  }
  return false
}

/** Check if character is within cooldown for learning */
export function canLearn(characterId: string): boolean {
  const last = learnCooldowns.get(characterId)
  if (!last) return true
  return Date.now() - last > LEARN_COOLDOWN_MS
}

/** Mark that learning just happened for this character */
export function markLearned(characterId: string): void {
  learnCooldowns.set(characterId, Date.now())
}

const OPTIMIZE_SYSTEM_PROMPT = `You are a character-setting optimizer for an AI roleplay chat app. Your task is to revise the character's System Prompt based on the user's latest feedback.

Rules:
1. Preserve the character's core identity, background, and personality — only adjust the aspects the user complained about or requested.
2. If the user asks to change how they are addressed (e.g. "call me master"), update that in the prompt.
3. If the user wants a different tone (e.g. "be more tsundere", "be gentler"), adjust the speech style description.
4. If the user says "don't say X" or "stop doing Y", add explicit prohibitions in the prompt.
5. Keep the prompt in second-person ("You are...").
6. Keep the prompt length similar to the original — don't make it dramatically longer.
7. Output ONLY the revised System Prompt text (no markdown, no code blocks, no JSON, no explanations). Just the raw prompt text.`

export async function optimizeSystemPrompt(
  settings: ApiSettings,
  currentSystemPrompt: string,
  userInstruction: string,
  recentConversation: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const { apiUrl, apiKey, model } = settings

  const convoText = recentConversation
    .map((m) => `${m.role === 'user' ? '用户' : '角色'}: ${m.content}`)
    .join('\n')

  const userMessage = `当前角色 System Prompt:
---
${currentSystemPrompt}
---

最近的对话:
---
${convoText}
---

用户对角色表现的意见: "${userInstruction}"

请根据用户的意见优化该角色的 System Prompt。`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: OPTIMIZE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      temperature: 0.7,
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
  if (!content) throw new Error('优化未返回有效结果')

  return content.trim()
}
