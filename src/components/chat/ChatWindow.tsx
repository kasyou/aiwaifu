import { useEffect, useRef, useCallback, useState } from 'react'
import { useStore } from '../../store/useStore'
import { streamChat } from '../../utils/api'
import Avatar from '../ui/Avatar'
import CharacterEditor from '../character/CharacterEditor'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import type { Message } from '../../types'

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function ChatWindow() {
  const {
    characters,
    activeCharacterId,
    chats,
    settings,
    addMessage,
    updateMessageContent,
    toggleSidebar,
  } = useStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  const activeChar = characters.find((c) => c.id === activeCharacterId)
  const messages = activeCharacterId ? chats[activeCharacterId] || [] : []

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (text: string, images: string[]) => {
    if (!activeCharacterId || !activeChar) return

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      images: images.length > 0 ? images : undefined,
      timestamp: Date.now(),
    }
    addMessage(activeCharacterId, userMsg)

    const assistantId = generateId()
    addMessage(activeCharacterId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    })

    if (!settings.apiKey) {
      updateMessageContent(
        activeCharacterId,
        assistantId,
        '请先在设置中配置 API Key（左侧边栏底部 → API 设置）。'
      )
      return
    }

    setIsStreaming(true)

    const allMsgs = [...(chats[activeCharacterId] || []), userMsg]
    const recentMsgs = allMsgs.slice(-30).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      images: m.images,
    }))

    let tokenBuffer = ''
    await streamChat(settings, activeChar.systemPrompt, recentMsgs, {
      onToken: (token) => {
        tokenBuffer += token
        updateMessageContent(activeCharacterId, assistantId, tokenBuffer)
      },
      onDone: () => {
        setIsStreaming(false)
      },
      onError: (error) => {
        const final = tokenBuffer + (tokenBuffer ? '\n\n' : '') + `[错误: ${error.message}]`
        updateMessageContent(activeCharacterId, assistantId, final)
        setIsStreaming(false)
      },
    })
  }

  if (!activeChar) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-lg font-semibold text-ink mb-2">欢迎使用 AiWaifu</h2>
          <p className="text-sm text-muted max-w-sm">
            从左侧边栏选择一个角色开始聊天，或创建一个新角色。
          </p>
        </div>
      </div>
    )
  }

  const streamingMsgId = isStreaming
    ? [...messages].reverse().find((m) => m.role === 'assistant')?.id ?? null
    : null

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-card hover:text-ink transition-colors md:hidden"
          title="打开侧边栏"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <Avatar avatar={activeChar.avatar} name={activeChar.name} size={9} />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-ink truncate">{activeChar.name}</h2>
          <p className="text-xs text-muted truncate">
            {activeChar.isPreset ? '预设角色' : '自定义角色'}
          </p>
        </div>

        {/* Edit character button */}
        <button
          type="button"
          onClick={() => setShowEditor(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-card hover:text-ink transition-colors"
          title="编辑角色"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-sm text-muted">
                开始和 {activeChar.name} 聊天吧
              </p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.id === streamingMsgId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} sendingBlocked={isStreaming} />

      {/* Character Editor Modal */}
      <CharacterEditor
        open={showEditor}
        characterId={activeCharacterId}
        onClose={() => setShowEditor(false)}
      />

    </div>
  )
}
