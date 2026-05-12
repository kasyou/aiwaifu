import { getDefaultAvatar } from '../../utils/avatar'

interface AvatarProps {
  avatar?: string    // base64 image, emoji character, or SVG data URI
  name: string       // character name, used for fallback initials
  size?: number      // in pixels (tailwind scale: sm=8, md=10, lg=12)
  className?: string
}

const sizeClasses: Record<number, string> = {
  8: 'h-8 w-8',
  9: 'h-9 w-9',
  10: 'h-10 w-10',
  12: 'h-12 w-12',
  14: 'h-14 w-14',
  16: 'h-16 w-16',
  20: 'h-20 w-20',
}

const fontSizeClasses: Record<number, string> = {
  8: 'text-[10px]',
  9: 'text-xs',
  10: 'text-sm',
  12: 'text-base',
  14: 'text-lg',
  16: 'text-xl',
  20: 'text-2xl',
}

export default function Avatar({ avatar, name, size = 10, className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size] || 'h-10 w-10'
  const fontClass = fontSizeClasses[size] || 'text-sm'

  // Determine what kind of avatar content we have
  const isImage =
    avatar &&
    (avatar.startsWith('data:image/') || avatar.startsWith('http'))

  const isEmoji = avatar && /^[\p{Emoji}]/u.test(avatar.trim()) && avatar.trim().length <= 4

  const displayAvatar =
    avatar || getDefaultAvatar(name)

  // If it's an image, render <img>
  if (isImage) {
    return (
      <div className={`${sizeClass} flex-shrink-0 rounded-full bg-hairline overflow-hidden ${className}`}>
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      </div>
    )
  }

  // If displayed avatar is a generated SVG or starts with data:image/svg
  if (displayAvatar.startsWith('data:image/svg')) {
    return (
      <div className={`${sizeClass} flex-shrink-0 rounded-full overflow-hidden ${className}`}>
        <img src={displayAvatar} alt={name} className="h-full w-full" />
      </div>
    )
  }

  // Fallback: render as text initials
  return (
    <div className={`${sizeClass} flex-shrink-0 rounded-full bg-hairline flex items-center justify-center ${className}`}>
      <span className={`${fontClass} font-medium text-muted`}>
        {name.charAt(0)}
      </span>
    </div>
  )
}
