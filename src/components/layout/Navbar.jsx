import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoAccent}>MINI</span>-Z
          <span className={styles.logoSub}>RC</span>
        </Link>

        {/* Desktop links */}
        <div className={styles.links}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
            {t('nav_dashboard')}
          </NavLink>
          <NavLink to="/schedule" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
            {t('nav_schedule')}
          </NavLink>
          {profile && (
            <NavLink to={`/driver/${profile.id}`} className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
              {t('nav_profile')}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? styles.linkActive : styles.link}>
              {t('nav_admin')}
            </NavLink>
          )}
        </div>

        {/* Right actions */}
        <div className={styles.actions}>
          <button onClick={toggle} className={styles.langToggle} aria-label="Toggle language">
            {lang.toUpperCase()}
          </button>
          {user ? (
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 12 }}>
              {t('nav_logout')}
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}>
              {t('nav_login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
