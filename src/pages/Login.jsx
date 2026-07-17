import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { signIn, signUp, isConfigured, user } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (!isConfigured) {
    return (
      <div className="shell auth-wrap">
        <div className="auth-card">
          <h1>Anmelden</h1>
          <p className="auth-sub">
            Audiora läuft gerade im Demo-Modus. Sobald in <code>src/supabase-config.js</code> die
            Supabase-URL und der Anon-Key eingetragen sind, funktionieren Registrierung und Login.
          </p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="shell auth-wrap">
        <div className="auth-card">
          <h1>Du bist angemeldet ✓</h1>
          <p className="auth-sub">Viel Spaß beim Entdecken.</p>
          <button className="btn cta" onClick={() => nav('/dna')}>Zu meinem Profil →</button>
        </div>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'register') {
        if (username.trim().length < 3) throw new Error('Der Nutzername braucht mindestens 3 Zeichen.')
        const { error } = await signUp(email.trim(), password, username.trim())
        if (error) throw error
        setInfo('Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.')
      } else {
        const { error } = await signIn(email.trim(), password)
        if (error) throw error
        nav('/dna')
      }
    } catch (err) {
      const msg = String(err.message || err)
      setError(
        msg.includes('Invalid login credentials') ? 'E-Mail oder Passwort ist falsch.'
        : msg.includes('already registered') ? 'Diese E-Mail ist bereits registriert.'
        : msg.includes('at least 6 characters') ? 'Das Passwort braucht mindestens 6 Zeichen.'
        : msg.includes('Email not confirmed') ? 'Bitte bestätige zuerst deine E-Mail-Adresse.'
        : msg,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shell auth-wrap">
      <div className="auth-card">
        <div className="kicker">{mode === 'login' ? 'Willkommen zurück' : 'Werde Teil der Community'}</div>
        <h1>{mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Bewerte, sammle und entdecke weiter, wo du aufgehört hast.'
            : 'Kostenlos registrieren und Favoriten, Listen und deine Audio-DNA speichern.'}
        </p>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <label>
              Nutzername
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="z. B. fabian"
                autoComplete="username"
                required
              />
            </label>
          )}
          <label>
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="du@beispiel.de"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Passwort
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mindestens 6 Zeichen"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <button className="btn cta" type="submit" disabled={busy}>
            {busy ? 'Einen Moment…' : mode === 'login' ? 'Anmelden' : 'Kostenlos registrieren'}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setInfo('') }}
        >
          {mode === 'login' ? 'Noch kein Konto? Jetzt registrieren →' : 'Schon ein Konto? Anmelden →'}
        </button>
      </div>
    </div>
  )
}
