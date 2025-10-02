export const KEY = 'advocate-diary:v1'
export const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
export const save = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))
export const exportJson = (arr) => {
  const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = 'advocate-diary-backup.json'; a.click(); URL.revokeObjectURL(a.href)
}
