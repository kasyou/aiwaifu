import ChatWindow from '../chat/ChatWindow'

interface ChatPageProps {
  onBack: () => void
}

export default function ChatPage({ onBack }: ChatPageProps) {
  return (
    <div className="flex h-full w-full flex-col bg-canvas">
      <ChatWindow onBack={onBack} isMobile />
    </div>
  )
}
