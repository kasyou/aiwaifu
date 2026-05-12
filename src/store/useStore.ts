import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character, Message, ApiSettings } from '../types'
import { DEFAULT_API_SETTINGS } from '../types'
import { PRESET_CHARACTERS } from '../utils/presets'

interface AppState {
  characters: Character[]
  chats: Record<string, Message[]>
  activeCharacterId: string | null
  settings: ApiSettings
  sidebarOpen: boolean
  pinnedOrder: string[] // ordered list of pinned character IDs

  // Character actions
  addCharacter: (char: Character) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  resetPresets: () => void

  // Pin actions
  pinCharacter: (id: string) => void
  unpinCharacter: (id: string) => void

  // Chat actions
  setActiveCharacter: (id: string) => void
  addMessage: (characterId: string, message: Message) => void
  updateMessageContent: (characterId: string, messageId: string, content: string) => void
  clearChat: (characterId: string) => void

  // Settings actions
  updateSettings: (updates: Partial<ApiSettings>) => void

  // UI
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

function ensurePresetChars(chars: Character[]): Character[] {
  const existing = new Set(chars.map((c) => c.id))
  const missing = PRESET_CHARACTERS.filter((p) => !existing.has(p.id))
  return [...chars, ...missing]
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      characters: [...PRESET_CHARACTERS],
      chats: {},
      activeCharacterId: PRESET_CHARACTERS[0]?.id ?? null,
      settings: { ...DEFAULT_API_SETTINGS },
      sidebarOpen: true,
      pinnedOrder: [],

      addCharacter: (char) => {
        set((s) => ({
          characters: [...s.characters, char],
          activeCharacterId: char.id,
        }))
      },

      updateCharacter: (id, updates) => {
        set((s) => ({
          characters: s.characters.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }))
      },

      deleteCharacter: (id) => {
        set((s) => {
          const remaining = s.characters.filter((c) => c.id !== id)
          const newChats = { ...s.chats }
          delete newChats[id]
          const newActive =
            s.activeCharacterId === id
              ? remaining[0]?.id ?? null
              : s.activeCharacterId
          return {
            characters: remaining,
            chats: newChats,
            activeCharacterId: newActive,
            pinnedOrder: s.pinnedOrder.filter((pid) => pid !== id),
          }
        })
      },

      resetPresets: () => {
        set((s) => {
          const nonPreset = s.characters.filter((c) => !PRESET_CHARACTERS.some((p) => p.id === c.id))
          return { characters: [...PRESET_CHARACTERS, ...nonPreset] }
        })
      },

      pinCharacter: (id) => {
        set((s) => ({
          pinnedOrder: s.pinnedOrder.includes(id)
            ? s.pinnedOrder
            : [...s.pinnedOrder, id],
        }))
      },

      unpinCharacter: (id) => {
        set((s) => ({
          pinnedOrder: s.pinnedOrder.filter((pid) => pid !== id),
        }))
      },

      setActiveCharacter: (id) => {
        set({ activeCharacterId: id })
      },

      addMessage: (characterId, message) => {
        set((s) => ({
          chats: {
            ...s.chats,
            [characterId]: [...(s.chats[characterId] || []), message],
          },
        }))
      },

      updateMessageContent: (characterId, messageId, content) => {
        set((s) => {
          const msgs = s.chats[characterId]
          if (!msgs) return s
          return {
            chats: {
              ...s.chats,
              [characterId]: msgs.map((m) =>
                m.id === messageId ? { ...m, content } : m
              ),
            },
          }
        })
      },

      clearChat: (characterId) => {
        set((s) => ({
          chats: { ...s.chats, [characterId]: [] },
        }))
      },

      updateSettings: (updates) => {
        set((s) => ({ settings: { ...s.settings, ...updates } }))
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'aiwaifu-storage',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.characters = ensurePresetChars(state.characters)
        }
      },
    }
  )
)
