import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/layout/Sidebar'
import ChatWindow from './components/chat/ChatWindow'
import SettingsModal from './components/layout/SettingsModal'
import CharacterListPage from './components/mobile/CharacterListPage'
import ChatPage from './components/mobile/ChatPage'
import { App as CapacitorApp } from '@capacitor/app'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<'list' | 'chat'>('list')
  const isMobile = useIsMobile()

  // Reset currentPage to list when switching to desktop
  useEffect(() => {
    if (!isMobile && currentPage === 'chat') {
      setCurrentPage('list')
    }
  }, [isMobile, currentPage])

  // Android back button: chat → list, list → default exit
  useEffect(() => {
    if (!isMobile) return
    let handler: { remove: () => void } | null = null
    CapacitorApp.addListener('backButton', () => {
      if (currentPage === 'chat') {
        setCurrentPage('list')
      }
      // on list view, don't intercept — let Capacitor default (exit app)
    }).then((h) => { handler = h })
    return () => { handler?.remove() }
  }, [isMobile, currentPage])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      {/* ════════════════ Mobile layout ════════════════ */}
      {isMobile && currentPage === 'list' && (
        <CharacterListPage
          onSelectCharacter={() => setCurrentPage('chat')}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}
      {isMobile && currentPage === 'chat' && (
        <ChatPage onBack={() => setCurrentPage('list')} />
      )}

      {/* ════════════════ Desktop layout ════════════════ */}
      {!isMobile && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div
            className={`fixed md:static z-30 h-full flex-shrink-0 transition-transform duration-200 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          >
            <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
          </div>
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <ChatWindow />
          </div>
        </>
      )}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
