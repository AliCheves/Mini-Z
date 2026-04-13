import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../contexts/LangContext'
import { useNextRaceDay, useRaceDayGrid } from '../hooks/useRaceDay'
import { useActiveChampionship, useChampionships } from '../hooks/useChampionships'
import { useStandings } from '../hooks/useStandings'
import { formatLapTime, formatDate, getCarTypeLabel } from '../lib/points'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { t, lang } = useLang()
  const { raceDay, loading: rdLoading } = useNextRaceDay()
  const { championship: activeChamp } = useActiveChampionship()
  const { championships } = useChampionships()
  const { grid } = useRaceDayGrid(raceDay?.id)
  const { standings } = useStandings(activeChamp?.id)

  return (
    <div className="container">
      <div className={styles.page}>

        {/* ── Hero: Next Race card ─────────────────────── */}
        <section className={styles.heroSection}>
          <NextRaceCard raceDay={raceDay} loading={rdLoading} t={t} lang={lang} />
          <StatsStrip standings={standings} raceDay={raceDay} t={t} />
        </section>

        {/* ── Championship progress pills ──────────────── */}
        <section>
          <h2 className={styles.sectionTitle}>{t('dash_champ_progress')}</h2>
          <ChampionshipPills championships={championships} activeId={activeChamp?.id} t={t} />
        </section>

        <div className={styles.twoCol}>
          {/* ── Starting Grid ──────────────────────────── */}
          <section>
            <h2 className={styles.sectionTitle}>{t('dash_starting_grid')}</h2>
            <StartingGrid grid={grid} t={t} />
          </section>

          {/* ── Top 5 Standings ─────────────────────────── */}
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('dash_standings_top5')}</h2>
              {activeChamp && (
                <Link to={`/standings/${activeChamp.id}`} className={styles.viewAll}>
                  {t('dash_view_all')} →
                </Link>
              )}
            </div>
            <MiniStandings standings={standings.slice(0, 5)} t={t} lang={lang} />
          </section>
        </div>

      </div>
    </div>
  )
}

// ── Next Race Card ────────────────────────────────────────────
function NextRaceCard({ raceDay, loading, t, lang }) {
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    if (!raceDay?.date) return
    function tick() {
      const target = new Date(raceDay.date + 'T19:00:00')
      const diff   = target - new Date()
      if (diff <= 0) { setCountdown(null); return }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [raceDay])

  if (loading) return <div className={`${styles.raceCard} skeleton`} style={{ height: 160 }} />

  if (!raceDay) return (
    <div className={`${styles.raceCard} card`}>
      <p className={styles.noData}>{t('dash_no_race')}</p>
    </div>
  )

  const champ = raceDay.championships
  const statusLabel = {
    upcoming:   <span className="badge badge-muted">{t('schedule_upcoming')}</span>,
    qualifying: <span className="badge badge-cyan">{t('schedule_qualifying')}</span>,
    racing:     <span className="badge badge-orange">{t('schedule_racing')}</span>,
    completed:  <span className="badge badge-muted">{t('schedule_completed')}</span>,
  }[raceDay.status]

  return (
    <div className={`${styles.raceCard} ${styles.raceCardGlow}`}>
      <div className={styles.raceCardHeader}>
        <div>
          <p className={styles.raceCardEyebrow}>
            {champ ? `${champ.type} — ${champ.direction}` : ''}
          </p>
          <h1 className={styles.raceCardTitle}>
            {t('dash_round')} {raceDay.round_number}
            <span className={styles.raceCardRoundOf}> / 16</span>
          </h1>
        </div>
        {statusLabel}
      </div>

      <p className={styles.raceCardDate}>{formatDate(raceDay.date, lang)}</p>
      <p className={styles.raceCardLocation}>{raceDay.location}</p>

      {countdown && (
        <div className={styles.countdown}>
          <CountdownUnit value={countdown.d} label={t('dash_days')} />
          <span className={styles.countdownSep}>:</span>
          <CountdownUnit value={countdown.h} label={t('dash_hours')} />
          <span className={styles.countdownSep}>:</span>
          <CountdownUnit value={countdown.m} label={t('dash_mins')} />
          <span className={styles.countdownSep}>:</span>
          <CountdownUnit value={countdown.s} label={t('dash_secs')} />
        </div>
      )}
    </div>
  )
}

function CountdownUnit({ value, label }) {
  return (
    <div className={styles.countdownUnit}>
      <span className={styles.countdownValue}>{String(value).padStart(2, '0')}</span>
      <span className={styles.countdownLabel}>{label}</span>
    </div>
  )
}

// ── Stats Strip ───────────────────────────────────────────────
function StatsStrip({ standings, raceDay, t }) {
  const leader = standings[0]
  const allBestLaps = standings.filter(s => s.best_lap).map(s => parseFloat(s.best_lap))
  const seasonFastLap = allBestLaps.length ? Math.min(...allBestLaps) : null
  const fastLapHolder = standings.find(s => s.best_lap && parseFloat(s.best_lap) === seasonFastLap)

  return (
    <div className={styles.statsStrip}>
      <StatCard
        label={t('dash_drivers')}
        value={standings.length || '—'}
        color="var(--accent3)"
      />
      <StatCard
        label={t('dash_round')}
        value={raceDay ? raceDay.round_number : '—'}
        color="var(--accent)"
      />
      <StatCard
        label={t('dash_season_fastlap')}
        value={seasonFastLap ? formatLapTime(seasonFastLap) : '—'}
        color="var(--accent3)"
        mono
      />
      <StatCard
        label={t('dash_pole_sitter')}
        value={leader?.profile?.nickname || leader?.profile?.display_name || '—'}
        color="var(--accent)"
      />
    </div>
  )
}

function StatCard({ label, value, color, mono }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span
        className={styles.statValue}
        style={{ color, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-heading)' }}
      >
        {value}
      </span>
    </div>
  )
}

// ── Championship Progress Pills ───────────────────────────────
function ChampionshipPills({ championships, activeId, t }) {
  if (!championships.length) return (
    <div className={styles.pillsRow}>
      {[1,2,3,4].map(i => <div key={i} className={`skeleton`} style={{ height: 56, borderRadius: 8, flex: 1 }} />)}
    </div>
  )

  return (
    <div className={styles.pillsRow}>
      {championships.map((c, i) => {
        const isActive   = c.id === activeId
        const isDone     = c.order_index < championships.find(x => x.id === activeId)?.order_index
        return (
          <Link
            key={c.id}
            to={`/standings/${c.id}`}
            className={`${styles.pill} ${isActive ? styles.pillActive : ''} ${isDone ? styles.pillDone : ''}`}
          >
            <span className={styles.pillIndex}>{i + 1}</span>
            <div className={styles.pillInfo}>
              <span className={styles.pillType}>{c.type}</span>
              <span className={styles.pillDir}>{c.direction}</span>
            </div>
            {isActive && <span className={styles.pillLive}>●</span>}
          </Link>
        )
      })}
    </div>
  )
}

// ── Starting Grid ─────────────────────────────────────────────
function StartingGrid({ grid, t }) {
  if (!grid.length) return (
    <div className="card" style={{ textAlign: 'center', padding: 32 }}>
      <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t('dash_no_race')}</p>
    </div>
  )

  return (
    <div className={styles.grid}>
      {grid.map((entry) => (
        <div key={entry.grid_position} className={`${styles.gridRow} ${entry.is_pole ? styles.gridRowPole : ''}`}>
          <span className={styles.gridPos}>P{entry.grid_position}</span>
          <div className={styles.gridDriver}>
            <span className={styles.gridNum}>#{entry.profiles?.car_number}</span>
            <span className={styles.gridName}>
              {entry.profiles?.nickname || entry.profiles?.display_name}
            </span>
            {entry.is_pole && <span className="badge badge-yellow" style={{ fontSize: 9 }}>POLE</span>}
          </div>
          <span className={`${styles.gridLap} font-mono`}>{formatLapTime(entry.lap_time)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Mini Standings ─────────────────────────────────────────────
function MiniStandings({ standings, t, lang }) {
  if (!standings.length) return (
    <div className="card" style={{ textAlign: 'center', padding: 32 }}>
      <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t('standings_no_data')}</p>
    </div>
  )

  const posColors = ['var(--accent)', '#c0c0c0', '#cd7f32']

  return (
    <div className={styles.miniStandings}>
      {standings.map((s, i) => (
        <Link key={s.driver_id} to={`/driver/${s.driver_id}`} className={styles.standingRow}>
          <span
            className={styles.standingPos}
            style={{ color: posColors[i] || 'var(--text3)' }}
          >
            P{i + 1}
          </span>
          <span className={styles.standingNum}>#{s.profile?.car_number}</span>
          <span className={styles.standingName}>
            {s.profile?.nickname || s.profile?.display_name}
          </span>
          <span className={styles.standingPts}>{s.points} <span style={{ color: 'var(--text3)', fontSize: 11 }}>{t('points_suffix')}</span></span>
        </Link>
      ))}
    </div>
  )
}
