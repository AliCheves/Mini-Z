import { useLang } from '../contexts/LangContext'
import { useAllRaceDays } from '../hooks/useRaceDay'
import { formatDate } from '../lib/points'
import styles from './Schedule.module.css'

const STATUS_BADGE = {
  upcoming:   { cls: 'badge-muted',   key: 'schedule_upcoming' },
  qualifying: { cls: 'badge-cyan',    key: 'schedule_qualifying' },
  racing:     { cls: 'badge-orange',  key: 'schedule_racing' },
  completed:  { cls: 'badge-muted',   key: 'schedule_completed' },
}

export default function Schedule() {
  const { t, lang } = useLang()
  const { raceDays, loading, error } = useAllRaceDays()

  // Group by date (each Monday = potentially 2 race_days)
  const grouped = {}
  for (const rd of raceDays) {
    if (!grouped[rd.date]) grouped[rd.date] = []
    grouped[rd.date].push(rd)
  }
  const dates = Object.keys(grouped).sort()

  return (
    <div className="container">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('schedule_title')}</h1>
          {raceDays[0]?.championships?.seasons && (
            <p className={styles.subtitle}>
              {raceDays[0].championships.seasons.name} — {raceDays[0].championships.seasons.year}
            </p>
          )}
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />
            ))}
          </div>
        ) : error ? (
          <p style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>{t('error')}: {error}</p>
        ) : dates.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{t('schedule_no_data')}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {dates.map(date => {
              const dayRaceDays = grouped[date]
              // Determine overall day status
              const hasRacing    = dayRaceDays.some(r => r.status === 'racing')
              const hasQual      = dayRaceDays.some(r => r.status === 'qualifying')
              const allCompleted = dayRaceDays.every(r => r.status === 'completed')
              const dayStatus    = hasRacing ? 'racing' : hasQual ? 'qualifying' : allCompleted ? 'completed' : 'upcoming'
              const badgeCfg     = STATUS_BADGE[dayStatus]

              // Get championship from first race day
              const champ = dayRaceDays[0]?.championships

              return (
                <div key={date} className={`${styles.dayCard} ${allCompleted ? styles.dayDone : ''}`}>
                  <div className={styles.dayLeft}>
                    <p className={styles.dayWeekday}>{t('schedule_monday')}</p>
                    <p className={styles.dayDate}>{formatDate(date, lang)}</p>
                    {champ && (
                      <p className={styles.dayChamp}>{champ.type} — {champ.direction}</p>
                    )}
                  </div>

                  <div className={styles.dayRight}>
                    <span className={`badge ${badgeCfg.cls}`}>{t(badgeCfg.key)}</span>

                    <div className={styles.roundPills}>
                      {dayRaceDays.map(rd => (
                        <RoundPill key={rd.id} rd={rd} t={t} />
                      ))}
                    </div>

                    {allCompleted && (
                      <div className={styles.completedRaces}>
                        {dayRaceDays.map(rd => (
                          rd.races?.map(race => (
                            <div key={race.id} className={styles.raceChip}>
                              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text3)' }}>
                                {t('schedule_races')} {race.race_number}
                              </span>
                              <span className={`badge ${race.status === 'completed' ? 'badge-muted' : 'badge-yellow'}`}>
                                {race.status === 'completed' ? '✓' : '—'}
                              </span>
                            </div>
                          ))
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function RoundPill({ rd, t }) {
  return (
    <div className={styles.roundPill}>
      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
        {t('schedule_round')} {rd.round_number}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
        {rd.location}
      </span>
    </div>
  )
}
