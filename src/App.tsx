import { useState } from 'react'
import { useStore } from './store/useStore'
import Sidebar from './components/layout/Sidebar'
import ChatWindow from './components/chat/ChatWindow'
import SettingsModal from './components/layout/SettingsModal'

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, overlay on mobile */}
      <div
        className={`fixed md:static z-30 h-full flex-shrink-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatWindow />
      </div>

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
