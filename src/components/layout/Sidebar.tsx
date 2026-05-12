import { useState, useMemo, useRef } from 'react'
import { useStore } from '../../store/useStore'
import Avatar from '../ui/Avatar'
import CharacterEditor from '../character/CharacterEditor'
import AICharacterGenerator from '../character/AICharacterGenerator'
import type { ChatExport, Message } from '../../types'

interface SidebarProps {
  onOpenSettings: () => void
}

export default function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    characters,
    activeCharacterId,
    chats,
    pinnedOrder,
    setActiveCharacter,
    deleteCharacter,
    pinCharacter,
    unpinCharacter,
    importMessages,
    resetPresets,
    toggleSidebar,
  } = useStore()

  const [showEditor, setShowEditor] = useState(false)
  const [showAIGen, setShowAIGen] = useState(false)
  const [editingCharId, setEditingCharId] = useState<string | null>(null)
  const [menuCharId, setMenuCharId] = useState<string | null>(null)

  // Import dialog state
  const [importDialog, setImportDialog] = useState<{
    charId: string
    charName: string
    messages: Message[]
  } | null>(null)

  const importFileRef = useRef<HTMLInputElement>(null)
  const importTargetRef = useRef<string | null>(null)

  const sortedCharacters = useMemo(() => {
    const pinned = pinnedOrder
      .map((id) => characters.find((c) => c.id === id))
      .filter(Boolean) as typeof characters
    const unpinned = characters.filter((c) => !pinnedOrder.includes(c.id))
    return [...pinned, ...unpinned]
  }, [characters, pinnedOrder])

  const handleEdit = (id: string) => {
    setEditingCharId(id)
    setMenuCharId(null)
  }

  const handleDelete = (id: string) => {
    deleteCharacter(id)
    setMenuCharId(null)
  }

  const handleSelectCharacter = (id: string) => {
    setActiveCharacter(id)
    if (window.innerWidth < 768) {
      toggleSidebar()
    }
  }

  // ── Export ─────────────────────────────────────────────
  const handleExport = (charId: string) => {
    setMenuCharId(null)
    const char = characters.find((c) => c.id === charId)
    if (!char) return
    const messages = chats[charId] || []

    const data: ChatExport = {
      version: 1,
      exportedAt: new Date().toISOString(),
      character: {
        id: char.id,
        name: char.name,
        systemPrompt: char.systemPrompt,
      },
      messages,
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

    const filename = `${char.name}_聊天记录_${ts}.json`
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
  const handleImportClick = (charId: string) => {
    setMenuCharId(null)
    importTargetRef.current = charId
    importFileRef.current?.click()
  }

  const handleImportFile = (file: File) => {
    const charId = importTargetRef.current
    if (!charId) return
    const char = characters.find((c) => c.id === charId)
    if (!char) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string)

        // Validate structure
        if (!raw.messages || !Array.isArray(raw.messages)) {
          alert('文件格式无效：缺少 messages 字段或格式不正确。')
          return
        }

        const messages: Message[] = raw.messages.filter(
          (m: unknown) =>
            m &&
            typeof m === 'object' &&
            typeof (m as Message).id === 'string' &&
            typeof (m as Message).content === 'string' &&
            ((m as Message).role === 'user' || (m as Message).role === 'assistant')
        )

        if (messages.length === 0) {
          alert('文件格式无效：未找到有效的聊天消息。')
          return
        }

        // Ensure every message has a timestamp
        for (const m of messages) {
          if (!m.timestamp) m.timestamp = Date.now()
        }

        setImportDialog({ charId, charName: char.name, messages })
      } catch {
        alert('无法解析该文件，请确认它是一个有效的 JSON 文件。')
      }
    }
    reader.onerror = () => {
      alert('文件读取失败，请重试。')
    }
    reader.readAsText(file)

    // Reset file input
    if (importFileRef.current) importFileRef.current.value = ''
  }

  const handleImportConfirm = (mode: 'overwrite' | 'append') => {
    if (!importDialog) return
    importMessages(importDialog.charId, importDialog.messages, mode)
    // Switch to that character to show the result
    setActiveCharacter(importDialog.charId)
    setImportDialog(null)
  }

  return (
    <>
      <div className="flex h-full w-72 flex-shrink-0 flex-col border-r border-hairline bg-canvas">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
          <h1 className="text-base font-semibold text-ink">✨ AiWaifu</h1>
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-card hover:text-ink transition-colors md:hidden"
            title="关闭侧边栏"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Character list */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {sortedCharacters.map((char) => {
            const isPinned = pinnedOrder.includes(char.id)
            return (
              <div
                key={char.id}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors relative ${
                  char.id === activeCharacterId
                    ? 'bg-surface-card text-ink'
                    : isPinned
                    ? 'bg-surface-cream-strong/40 text-body hover:bg-surface-card/50'
                    : 'hover:bg-surface-card/50 text-body'
                }`}
                onClick={() => handleSelectCharacter(char.id)}
              >
                {/* Pin indicator bar */}
                {isPinned && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
                )}
                <Avatar avatar={char.avatar} name={char.name} size={10} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-1">
                    {isPinned && <span className="text-[10px]">📌</span>}
                    {char.name}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {char.isPreset ? '预设角色' : '自定义角色'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuCharId(menuCharId === char.id ? null : char.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-hairline hover:text-ink transition-all"
                  title="更多操作"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {/* Context menu */}
                {menuCharId === char.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuCharId(null)
                      }}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-hairline bg-canvas shadow-lg py-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(char.id)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-body"
                      >
                        编辑
                      </button>
                      {isPinned ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            unpinCharacter(char.id)
                            setMenuCharId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-body"
                        >
                          取消置顶
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            pinCharacter(char.id)
                            setMenuCharId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-body"
                        >
                          置顶
                        </button>
                      )}
                      {/* Separator */}
                      <div className="my-1 border-t border-hairline" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExport(char.id)
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImportClick(char.id)
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(char.id)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-surface-card text-red-500"
                      >
                        删除
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

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

        {/* Bottom actions */}
        <div className="border-t border-hairline p-3 space-y-2">
          <button
            type="button"
            onClick={() => setShowEditor(true)}
            className="w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm font-medium text-body hover:bg-surface-card transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新建角色
          </button>
          <button
            type="button"
            onClick={() => setShowAIGen(true)}
            className="w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            AI 生成
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm font-medium text-muted hover:text-ink hover:bg-surface-card transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            API 设置
          </button>

          <button
            type="button"
            onClick={resetPresets}
            className="w-full rounded-lg px-4 py-2 text-xs text-muted hover:text-body transition-colors"
          >
            重置默认角色
          </button>
        </div>
      </div>

      {/* Character Editor Modal */}
      <CharacterEditor
        open={showEditor || editingCharId !== null}
        characterId={editingCharId}
        onClose={() => {
          setShowEditor(false)
          setEditingCharId(null)
        }}
      />

      {/* AI Generator Modal */}
      <AICharacterGenerator open={showAIGen} onClose={() => setShowAIGen(false)} />

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
    </>
  )
}
