// ── Time detection ──────────────────────────────────────────
const TIME_KEYWORDS = [
  '几点', '什么时间', '现在时间', '几号', '星期几',
  '今天几', '今天星期', '日期', '当前时间', '现在是什么时候',
  '现在几点', '今天是什么日子',
]

export function detectTimeIntent(message: string): boolean {
  return TIME_KEYWORDS.some((k) => message.includes(k))
}

// ── Location detection ─────────────────────────────────────
const LOCATION_KEYWORDS = [
  '在哪里', '我在哪', '什么地方', '我的位置',
  '你在哪', '这是哪', '当前的位置', '我现在在',
  '现在在哪', '定位',
]

export function detectLocationIntent(message: string): boolean {
  return LOCATION_KEYWORDS.some((k) => message.includes(k))
}

// ── Time formatting ────────────────────────────────────────
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export function formatCurrentTime(): string {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// ── Geolocation ────────────────────────────────────────────
let cachedPosition: { lat: number; lng: number } | null = null
let positionError: string | null = null

export async function getCurrentPosition(): Promise<string> {
  if (cachedPosition) {
    return `纬度${cachedPosition.lat.toFixed(2)}, 经度${cachedPosition.lng.toFixed(2)}`
  }
  if (positionError) {
    throw new Error(positionError)
  }

  if (!navigator.geolocation) {
    positionError = '浏览器不支持定位功能'
    throw new Error(positionError)
  }

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 300000, // 5 min cache
      })
    })
    cachedPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    }
    return `纬度${cachedPosition.lat.toFixed(2)}, 经度${cachedPosition.lng.toFixed(2)}`
  } catch (err) {
    if (err instanceof GeolocationPositionError) {
      positionError = err.code === 1 ? '用户拒绝了位置权限' : '定位失败'
    } else {
      positionError = '定位失败'
    }
    throw new Error(positionError)
  }
}

// ── Context injection builder ──────────────────────────────

export interface ContextInjection {
  /** Appended to the system prompt for this request only */
  systemNote: string
}

export async function buildContextInjection(text: string): Promise<ContextInjection | null> {
  const needTime = detectTimeIntent(text)
  const needLocation = detectLocationIntent(text)

  if (!needTime && !needLocation) return null

  const parts: string[] = []

  if (needTime) {
    parts.push(`当前真实时间：${formatCurrentTime()}。请参考此时间如实回答用户的问题。`)
  }

  if (needLocation) {
    try {
      const loc = await getCurrentPosition()
      parts.push(`用户当前的大致坐标：${loc}。请参考此位置如实回答用户的问题。`)
    } catch {
      parts.push('用户询问了位置信息，但暂时无法获取定位（权限未授予或定位失败）。请告诉用户你无法获取其位置，建议检查浏览器的位置权限设置。')
    }
  }

  if (parts.length === 0) return null

  return {
    systemNote: '\n\n[系统上下文] ' + parts.join(' '),
  }
}
