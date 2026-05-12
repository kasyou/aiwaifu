import type { Message } from '../../types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className={`flex gap-2 mb-2 flex-wrap ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Upload ${i + 1}`}
                className="max-h-48 max-w-[240px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Text bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-surface-card text-body rounded-bl-md'
          }`}
        >
          {message.content || (isStreaming ? (
            <span className="inline-block w-2 h-4 bg-body animate-pulse rounded-sm align-text-bottom" />
          ) : (
            <span className="text-muted italic">Empty message</span>
          ))}
          {isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 bg-body animate-pulse rounded-sm align-text-bottom ml-0.5" />
          )}
        </div>
      </div>
    </div>
  )
}
