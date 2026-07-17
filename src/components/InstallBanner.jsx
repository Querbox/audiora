import { useEffect, useState } from 'react'

const DISMISS_KEY = 'audiora-install-dismissed'
const DISMISS_DAYS = 14

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

const recentlyDismissed = () => {
  const t = Number(localStorage.getItem(DISMISS_KEY) || 0)
  return Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null) // Android/Chrome: beforeinstallprompt-Event
  const [show, setShow] = useState(false)
  const debug = new URLSearchParams(location.search).has('pwa-debug')

  useEffect(() => {
    if (isStandalone() || (recentlyDismissed() && !debug)) return

    const onPrompt = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // iOS kennt kein Install-Event – dort Anleitung zeigen
    if (isIos() || debug) setShow(true)

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [debug])

  if (!show) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    else dismiss()
  }

  const ios = !prompt && (isIos() || debug)

  return (
    <div className="install-banner" role="dialog" aria-label="Audiora installieren">
      <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="ib-icon" />
      <div className="ib-text">
        <b>Audiora als App</b>
        {ios ? (
          <span>
            Tippe auf <span className="ib-share">⎋</span> Teilen und dann auf
            {' '}<b>„Zum Home-Bildschirm“</b> – schon ist Audiora eine App.
          </span>
        ) : (
          <span>Installiere Audiora auf deinem Home-Bildschirm – schnell, im Vollbild, offline-fähig.</span>
        )}
      </div>
      {!ios && <button className="btn primary ib-cta" onClick={install}>Installieren</button>}
      <button className="ib-close" onClick={dismiss} aria-label="Schließen">✕</button>
    </div>
  )
}
