import { useState, useMemo } from 'react'
import { useStore } from '../../store/useStore'
import Avatar from '../ui/Avatar'
import CharacterEditor from '../character/CharacterEditor'
import AICharacterGenerator from '../character/AICharacterGenerator'

interface SidebarProps {
  onOpenSettings: () => void
}

export default function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    characters,
    activeCharacterId,
    pinnedOrder,
    setActiveCharacter,
    deleteCharacter,
    pinCharacter,
    unpinCharacter,
    resetPresets,
    toggleSidebar,
  } = useStore()

  const [showEditor, setShowEditor] = useState(false)
  const [showAIGen, setShowAIGen] = useState(false)
  const [editingCharId, setEditingCharId] = useState<string | null>(null)
  const [menuCharId, setMenuCharId] = useState<string | null>(null)

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
                    <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-hairline bg-canvas shadow-lg py-1">
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

          {/* Settings button — moved here from floating corner */}
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
    </>
  )
}
