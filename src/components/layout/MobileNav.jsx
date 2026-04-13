import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import styles from './MobileNav.module.css'

// Inline SVG icons (no emoji)
function HomeIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> }
function CalendarIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function UserIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> }
function SettingsIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> }
function TrophyIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12v7a6 6 0 01-12 0V2z"/><path d="M6 4H2v3a4 4 0 004 4"/><path d="M18 4h4v3a4 4 0 01-4 4"/><path d="M12 15v6"/><path d="M8 21h8"/></svg> }

export default function MobileNav() {
  const { profile, isAdmin } = useAuth()
  const { t } = useLang()

  return (
    <nav className={`mobile-nav ${styles.nav}`} role="navigation" aria-label="Mobile navigation">
      <NavLink to="/" end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}><HomeIcon /></span>
        <span className={styles.label}>{t('nav_dashboard')}</span>
      </NavLink>
      <NavLink to="/schedule" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}><CalendarIcon /></span>
        <span className={styles.label}>{t('nav_schedule')}</span>
      </NavLink>
      <NavLink to={profile ? `/driver/${profile.id}` : '/login'} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}><UserIcon /></span>
        <span className={styles.label}>{t('nav_profile')}</span>
      </NavLink>
      <NavLink to="/standings/active" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}><TrophyIcon /></span>
        <span className={styles.label}>{t('nav_standings')}</span>
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <span className={styles.icon}><SettingsIcon /></span>
          <span className={styles.label}>{t('nav_admin')}</span>
        </NavLink>
      )}
    </nav>
  )
}
