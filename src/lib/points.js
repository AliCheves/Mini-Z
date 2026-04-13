// Standard RC points scale
export const POINTS_SCALE = {
  1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
  6: 5,  7: 4,  8: 3,  9: 2, 10: 1,
}

export function getPoints(finishPosition) {
  return POINTS_SCALE[finishPosition] ?? 0
}

export function formatLapTime(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const s = parseFloat(seconds)
  if (isNaN(s)) return '—'
  const mins = Math.floor(s / 60)
  const secs = (s % 60).toFixed(3).padStart(6, '0')
  return mins > 0 ? `${mins}:${secs}` : `${secs}s`
}

export function formatDate(dateStr, lang = 'es') {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(lang === 'es' ? 'es-SV' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function formatShortDate(dateStr, lang = 'es') {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString(lang === 'es' ? 'es-SV' : 'en-US', {
    month: 'short', day: 'numeric'
  })
}

export function getCarTypeLabel(type, t) {
  const map = {
    stock_plastica: t('car_stock_plastica'),
    modif:          t('car_modif'),
    pancar:         t('car_pancar'),
    touring:        t('car_touring'),
  }
  return map[type] ?? type
}
