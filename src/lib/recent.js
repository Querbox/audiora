// „Zuletzt angesehen“ – echtes Nutzerverhalten, lokal im Browser gespeichert
const KEY = 'audiora-recent'

export function trackRecent(id) {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]').filter((x) => x.id !== id)
    arr.unshift({ id, ts: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 12)))
  } catch { /* privater Modus o. Ä. */ }
}

export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]').map((x) => x.id)
  } catch {
    return []
  }
}
