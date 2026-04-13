import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import styles from './Login.module.css'

export default function Login() {
  const { signIn, profile } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await signIn(email, password)
      // Small delay for profile to load, then redirect
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 300)
    } catch {
      setError(t('login_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Background grid lines */}
      <div className={styles.bgGrid} aria-hidden />

      <div className={styles.card} role="main">
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoAccent}>MINI</span>-Z
          <span className={styles.logoSub}>RC</span>
        </div>
        <p className={styles.subtitle}>{t('login_subtitle')}</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="field">
            <label htmlFor="email" className="label">{t('login_email')}</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="password" className="label">{t('login_password')}</label>
            <div className={styles.passwordField}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`input ${styles.passwordInput}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passToggle}
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submit}`}
            disabled={loading || !email || !password}
          >
            {loading ? t('login_loading') : t('login_submit')}
          </button>
        </form>

        <button onClick={toggle} className={styles.langToggle}>
          {lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        </button>
      </div>
    </div>
  )
}

function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function EyeOffIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
}
