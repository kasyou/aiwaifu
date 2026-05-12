const EMOJI_POOL = [
  '😊', '🌟', '💫', '✨', '🌸', '🎀', '💕', '🐱',
  '🎭', '💜', '🦋', '🌙', '⭐', '🔮', '🎪', '💎',
  '🌺', '🍀', '🎵', '🔥', '💖', '🐰', '🕊️', '🌻',
]

const COLOR_POOL = [
  '#cc785c', '#5db8a6', '#e8a55a', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f59e0b', '#10b981',
  '#6366f1', '#f43f5e', '#14b8a6', '#a855f7',
]

export function pickDeterministicEmoji(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  }
  return EMOJI_POOL[Math.abs(hash) % EMOJI_POOL.length]
}

export function pickDeterministicColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  }
  return COLOR_POOL[Math.abs(hash) % COLOR_POOL.length]
}

export function generateSvgAvatar(name: string, size = 128): string {
  const initials = name.slice(0, 2).toUpperCase()
  const bgColor = pickDeterministicColor(name)
  const textColor = '#ffffff'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size / 4}" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${size * 0.4}px" font-weight="600" fill="${textColor}">${initials}</text>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function generateEmojiAvatar(emoji: string, size = 128): string {
  const bgColor = pickDeterministicColor(emoji)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size / 4}" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-size="${size * 0.55}px">${emoji}</text>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function getDefaultAvatar(name: string, emoji?: string): string {
  if (emoji) return generateEmojiAvatar(emoji)
  return generateSvgAvatar(name)
}
