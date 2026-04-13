import { useParams, useNavigate } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { useStandings } from '../hooks/useStandings'
import { useChampionships, useActiveChampionship } from '../hooks/useChampionships'
import { formatLapTime, getCarTypeLabel } from '../lib/points'
import styles from './Standings.module.css'

export default function Standings() {
  const { championshipId } = useParams()
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const { championship: activeChamp } = useActiveChampionship()
  const { championships } = useChampionships()

  // If 'active' keyword, redirect to actual active championship
  const resolvedId = championshipId === 'active' ? activeChamp?.id : championshipId

  const { standings, loading, error } = useStandings(resolvedId)

  const currentChamp = championships.find(c => c.id === resolvedId)

  return (
    <div className="container">
      <div className={styles.page}>

        <header className={styles.header}>
          <h1 className={styles.title}>{t('standings_title')}</h1>
          {currentChamp && (
            <p className={styles.subtitle}>{currentChamp.type} — {currentChamp.direction}</p>
          )}
        </header>

        {/* Championship tabs */}
        <div className={styles.tabs} role="tablist">
          {championships.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === resolvedId}
              className={`${styles.tab} ${c.id === resolvedId ? styles.tabActive : ''}`}
              onClick={() => navigate(`/standings/${c.id}`)}
            >
              <span className={styles.tabNum}>{i + 1}</span>
              <span className={styles.tabLabel}>{c.type}</span>
              <span className={styles.tabDir}>{c.direction}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="card" style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t('error')}: {error}</div>
        ) : standings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            {t('standings_no_data')}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>{t('standings_pos')}</th>
                  <th style={{ width: 40 }}>{t('standings_number')}</th>
                  <th>{t('standings_driver')}</th>
                  <th className={styles.hideSmall}>{t('standings_car_type')}</th>
                  <th className={styles.hideSmall}>{t('standings_best_lap')}</th>
                  <th style={{ width: 60 }}>{t('standings_wins')}</th>
                  <th style={{ width: 80, textAlign: 'right' }}>{t('standings_points')}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <StandingsRow key={s.driver_id} s={s} pos={i + 1} t={t} lang={lang} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StandingsRow({ s, pos, t, lang }) {
  const posColor = { 1: 'var(--accent)', 2: '#c0c0c0', 3: '#cd7f32' }[pos] || 'var(--text3)'
  const rowClass = { 1: 'row-p1', 2: 'row-p2', 3: 'row-p3' }[pos] || ''

  return (
    <tr className={rowClass}>
      <td>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: posColor }}>
          P{pos}
        </span>
      </td>
      <td>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text3)', fontSize: 13 }}>
          #{s.profile?.car_number}
        </span>
      </td>
      <td>
        <a href={`/driver/${s.driver_id}`} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, textTransform: 'uppercase' }}>
            {s.profile?.display_name}
          </span>
          {s.profile?.nickname && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent3)' }}>
              "{s.profile.nickname}"
            </span>
          )}
        </a>
      </td>
      <td className={`${rowClass ? '' : ''} ${styles.hideSmall}`}>
        <span className="badge badge-muted">{getCarTypeLabel(s.profile?.car_type, t)}</span>
      </td>
      <td className={styles.hideSmall}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent3)' }}>
          {formatLapTime(s.best_lap)}
        </span>
      </td>
      <td>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700 }}>
          {s.wins}
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
          {s.points}
        </span>
      </td>
    </tr>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 52, borderRadius: 4 }} />
      ))}
    </div>
  )
}
