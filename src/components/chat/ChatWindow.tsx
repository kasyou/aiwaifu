import { useEffect, useRef, useCallback, useState } from 'react'
import { useStore } from '../../store/useStore'
import { streamChat } from '../../utils/api'
import { detectLearnIntent, canLearn, markLearned, optimizeSystemPrompt } from '../../utils/learn'
import { buildContextInjection } from '../../utils/context'
import Avatar from '../ui/Avatar'
import CharacterEditor from '../character/CharacterEditor'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import LearnConfirm from './LearnConfirm'
import type { Message, ChatExport } from '../../types'

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface ChatWindowProps {
  onBack?: () => void
  isMobile?: boolean
}

export default function ChatWindow({ onBack, isMobile }: ChatWindowProps) {
  const {
    characters,
    activeCharacterId,
    chats,
    settings,
    pinnedOrder,
    addMessage,
    updateMessageContent,
    updateCharacter,
    deleteCharacter,
    pinCharacter,
    unpinCharacter,
    clearChat,
    importMessages,
    toggleSidebar,
  } = useStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Learning state
  const [learnState, setLearnState] = useState<{
    oldPrompt: string
    newPrompt: string
  } | null>(null)
  const [isLearning, setIsLearning] = useState(false)

  // Import dialog state
  const [importDialog, setImportDialog] = useState<{
    charName: string
    messages: Message[]
  } | null>(null)

  const activeChar = characters.find((c) => c.id === activeCharacterId)
  const messages = activeCharacterId ? chats[activeCharacterId] || [] : []

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ── Export ─────────────────────────────────────────────
  const handleExport = () => {
    setShowMobileMenu(false)
    if (!activeChar || !activeCharacterId) return
    const msgs = chats[activeCharacterId] || []

    const data: ChatExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      character: {
        id: activeChar.id,
        name: activeChar.name,
        systemPrompt: activeChar.systemPrompt,
      },
      messages: msgs,
    }

    const now = new Date()
    const ts =
      String(now.getFullYear()) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      '_' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')

    const filename = `${activeChar.name}_聊天记录_${ts}.json`
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Import ─────────────────────────────────────────────
  const handleImportClick = () => {
    setShowMobileMenu(false)
    importFileRef.current?.click()
  }

  const handleImportFile = (file: File) => {
    if (!activeChar || !activeCharacterId) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string)

        if (!raw.messages || !Array.isArray(raw.messages)) {
          alert('文件格式无效：缺少 messages 字段或格式不正确。')
          return
        }

        const msgs: Message[] = raw.messages.filter(
          (m: unknown) =>
            m &&
            typeof m === 'object' &&
            typeof (m as Message).id === 'string' &&
            typeof (m as Message).content === 'string' &&
            ((m as Message).role === 'user' || (m as Message).role === 'assistant')
        )

        if (msgs.length === 0) {
          alert('文件格式无效：未找到有效的聊天消息。')
          return
        }

        for (const m of msgs) {
          if (!m.timestamp) m.timestamp = Date.now()
        }

        setImportDialog({ charName: activeChar.name, messages: msgs })
      } catch {
        alert('无法解析该文件，请确认它是一个有效的 JSON 文件。')
      }
    }
    reader.onerror = () => {
      alert('文件读取失败，请重试。')
    }
    reader.readAsText(file)

    if (importFileRef.current) importFileRef.current.value = ''
  }

  const handleImportConfirm = (mode: 'overwrite' | 'append') => {
    if (!importDialog || !activeCharacterId) return
    importMessages(activeCharacterId, importDialog.messages, mode)
    setImportDialog(null)
  }

  // ── Clear ──────────────────────────────────────────────
  const handleClearChatConfirm = () => {
    if (!activeCharacterId) return
    clearChat(activeCharacterId)
    setShowClearConfirm(false)
  }

  // ── Delete character ───────────────────────────────────
  const handleDeleteChar = () => {
    setShowMobileMenu(false)
    if (!activeCharacterId) return
    deleteCharacter(activeCharacterId)
    // Back to character list after deletion
    if (onBack) onBack()
  }

  // ── Pin / Unpin ────────────────────────────────────────
  const handleTogglePin = () => {
    setShowMobileMenu(false)
    if (!activeCharacterId) return
    if (pinnedOrder.includes(activeCharacterId)) {
      unpinCharacter(activeCharacterId)
    } else {
      pinCharacter(activeCharacterId)
    }
  }

  // ── Send message ───────────────────────────────────────
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

    let shouldLearn = false
    if (settings.apiKey && detectLearnIntent(text) && canLearn(activeCharacterId)) {
      shouldLearn = true
    }

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

    const ctx = await buildContextInjection(text)
    const systemPrompt = ctx
      ? activeChar.systemPrompt + ctx.systemNote
      : activeChar.systemPrompt

    setIsStreaming(true)

    const allMsgs = [...(chats[activeCharacterId] || []), userMsg]
    const recentMsgs = allMsgs.slice(-30).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      images: m.images,
    }))

    let tokenBuffer = ''
    await streamChat(settings, systemPrompt, recentMsgs, {
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

    if (shouldLearn) {
      setIsLearning(true)
      markLearned(activeCharacterId)

      const learnMsgId = generateId()
      addMessage(activeCharacterId, {
        id: learnMsgId,
        role: 'assistant',
        content: '学习',
        timestamp: Date.now(),
      })

      try {
        const allMessages = chats[activeCharacterId] || []
        const recentConvo = allMessages.slice(-20).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

        const newPrompt = await optimizeSystemPrompt(
          settings,
          activeChar.systemPrompt,
          text,
          recentConvo
        )

        updateMessageContent(
          activeCharacterId,
          learnMsgId,
          '角色已分析你的建议，请确认是否应用新设定。'
        )

        setLearnState({
          oldPrompt: activeChar.systemPrompt,
          newPrompt,
        })
      } catch (error) {
        updateMessageContent(
          activeCharacterId,
          learnMsgId,
          `角色学习失败: ${error instanceof Error ? error.message : '未知错误'}`
        )
      } finally {
        setIsLearning(false)
      }
    }
  }

  const handleApplyLearn = () => {
    if (!learnState || !activeCharacterId) return
    updateCharacter(activeCharacterId, { systemPrompt: learnState.newPrompt })
    addMessage(activeCharacterId, {
      id: generateId(),
      role: 'assistant',
      content: '角色设定已更新，后续对话将按照新风格进行。',
      timestamp: Date.now(),
    })
    setLearnState(null)
  }

  const handleCancelLearn = () => {
    setLearnState(null)
  }

  // ── Empty state ────────────────────────────────────────
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

  const isPinned = !!activeCharacterId && pinnedOrder.includes(activeCharacterId)

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full bg-canvas">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        {/* Mobile: back arrow; Desktop: hamburger (hidden on md+) */}
        {isMobile ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-card hover:text-ink transition-colors"
            title="返回角色列表"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
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
        )}
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

        {/* Mobile: ☰ menu button */}
        {isMobile && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-card hover:text-ink transition-colors"
              title="更多操作"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Mobile context menu */}
            {showMobileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMobileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-hairline bg-canvas shadow-lg py-1">
                  <button
                    type="button"
                    onClick={handleTogglePin}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-body"
                  >
                    {isPinned ? '取消置顶' : '置顶'}
                  </button>
                  {/* Separator */}
                  <div className="my-1 border-t border-hairline" />
                  <button
                    type="button"
                    onClick={handleExport}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-body flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    导出聊天记录
                  </button>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-body flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    导入聊天记录
                  </button>
                  {/* Separator */}
                  <div className="my-1 border-t border-hairline" />
                  <button
                    type="button"
                    onClick={() => { setShowMobileMenu(false); setShowClearConfirm(true) }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-red-500"
                  >
                    清空对话
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteChar}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-red-500"
                  >
                    删除角色
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !isLearning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-sm text-muted">
                开始和 {activeChar.name} 聊天吧
              </p>
            </div>
          </div>
        )}
        {isLearning && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-muted animate-pulse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              角色正在学习你的建议，请稍候...
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
      <ChatInput onSend={handleSend} sendingBlocked={isStreaming || isLearning} />

      {/* Hidden file input for import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImportFile(file)
        }}
        className="hidden"
      />

      {/* Character Editor Modal */}
      <CharacterEditor
        open={showEditor}
        characterId={activeCharacterId}
        onClose={() => setShowEditor(false)}
      />

      {/* Learn confirmation dialog */}
      {learnState && (
        <LearnConfirm
          open={learnState !== null}
          charName={activeChar.name}
          oldPrompt={learnState.oldPrompt}
          newPrompt={learnState.newPrompt}
          onApply={handleApplyLearn}
          onCancel={handleCancelLearn}
        />
      )}

      {/* Clear chat confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-canvas rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-ink mb-2">清空对话</h3>
            <p className="text-sm text-body mb-5">
              确定要清空与 {activeChar.name} 的所有对话记录吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-body hover:bg-surface-card transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleClearChatConfirm}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import overwrite/append dialog */}
      {importDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-canvas rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-ink mb-2">导入聊天记录</h3>
            <p className="text-sm text-body mb-5">
              将为 <strong>{importDialog.charName}</strong> 导入{' '}
              <strong>{importDialog.messages.length}</strong> 条消息。请选择导入方式：
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setImportDialog(null)}
                className="rounded-lg border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-body hover:bg-surface-card transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleImportConfirm('append')}
                className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => handleImportConfirm('overwrite')}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-active transition-colors"
              >
                覆盖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
