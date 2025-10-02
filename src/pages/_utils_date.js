export function format(isoDate) {
  if (!isoDate) return '—'
  try {
    const d = new Date(isoDate + 'T00:00:00')
    return d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit'
    })
  } catch {
    return isoDate
  }
}
