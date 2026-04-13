import { useParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import { useDriverProfile } from '../hooks/useDriverProfile'
import { formatLapTime, formatShortDate, getCarTypeLabel } from '../lib/points'
import styles from './DriverProfile.module.css'

export default function DriverProfile() {
  const { driverId } = useParams()
  const { profile: myProfile, isAdmin } = useAuth()
  const { t, lang } = useLang()

  const { profile, stats, history, lapData, loading, error } = useDriverProfile(driverId)

  const canEdit = isAdmin || myProfile?.id === driverId

  if (loading) return <LoadingState />
  if (error || !profile) return (
    <div className="container" style={{ padding: '40px 0' }}>
      <p style={{ color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>{t('error')}: {error || t('no_data')}</p>
    </div>
  )

  const champKeys = Object.keys(lapData)

  return (
    <div className="container">
      <div className={styles.page}>

        {/* ── Driver Card ─────────────────────────────── */}
        <div className={styles.driverCard}>
          <div className={styles.driverAvatar}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} className={styles.avatarImg} />
              : <AvatarPlaceholder name={profile.display_name} />
            }
          </div>
          <div className={styles.driverInfo}>
            <div className={styles.driverMeta}>
              <span className={`${styles.carNumber} font-mono`}>#{profile.car_number}</span>
              {profile.car_type && (
                <span className="badge badge-cyan">{getCarTypeLabel(profile.car_type, t)}</span>
              )}
              {profile.role === 'admin' && <span className="badge badge-orange">Admin</span>}
            </div>
            <h1 className={styles.driverName}>{profile.display_name}</h1>
            {profile.nickname && (
              <p className={styles.driverNickname}>"{profile.nickname}"</p>
            )}
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────── */}
        {stats && (
          <div className={styles.statsRow}>
            <StatBadge label={t('profile_total_points')} value={stats.totalPoints} accent="var(--accent)" />
            <StatBadge label={t('profile_wins')}         value={stats.wins}        accent="var(--accent)" />
            <StatBadge label={t('profile_poles')}        value={stats.poles}       accent="var(--accent3)" />
            <StatBadge label={t('profile_fast_laps')}    value={stats.fastLaps}    accent="var(--accent3)" />
            <StatBadge
              label={t('profile_best_lap')}
              value={formatLapTime(stats.bestLap)}
              accent="var(--accent3)"
              mono
            />
          </div>
        )}

        {/* ── Lap Time Chart ───────────────────────────── */}
        {champKeys.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>{t('profile_lap_history')}</h2>
            <div className={styles.chartCard}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                  <XAxis
                    dataKey="round"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    tickFormatter={v => formatLapTime(v)}
                    tick={{ fill: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    width={64}
                    reversed
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg3)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--text)',
                    }}
                    formatter={(v) => formatLapTime(v)}
                    labelFormatter={v => `${t('schedule_round')} ${v}`}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: 'var(--font-heading)', fontSize: 11, textTransform: 'uppercase' }}
                  />
                  {champKeys.map((key, i) => (
                    <Line
                      key={key}
                      data={lapData[key]}
                      dataKey="lap"
                      name={key}
                      stroke={['var(--accent)', 'var(--accent3)', 'var(--accent2)', '#a0a0ff'][i % 4]}
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'var(--bg)', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── Race History Table ───────────────────────── */}
        <section>
          <h2 className={styles.sectionTitle}>{t('profile_race_history')}</h2>
          {history.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {t('profile_no_results')}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('profile_date')}</th>
                    <th>{t('profile_race')}</th>
                    <th>{t('profile_pos')}</th>
                    <th>{t('profile_lap')}</th>
                    <th style={{ textAlign: 'right' }}>{t('profile_points')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => {
                    const rd = r.races?.race_days
                    return (
                      <tr key={i}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>
                            {rd ? formatShortDate(rd.date, lang) : '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13 }}>
                            {rd ? `R${rd.round_number} — ${t('schedule_races')} ${r.races?.race_number}` : '—'}
                          </span>
                        </td>
                        <td>
                          {r.dnf ? (
                            <span className="badge badge-orange">{t('profile_dnf')}</span>
                          ) : (
                            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>
                              {r.finish_position ? `P${r.finish_position}` : '—'}
                            </span>
                          )}
                          {r.is_fastest_lap && <span className="badge badge-cyan" style={{ marginLeft: 6, fontSize: 9 }}>FL</span>}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent3)' }}>
                            {formatLapTime(r.fastest_lap)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
                            {r.points_earned}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function StatBadge({ label, value, accent, mono }) {
  return (
    <div className={styles.statBadge}>
      <span className={styles.statLabel}>{label}</span>
      <span
        className={styles.statValue}
        style={{
          color: accent,
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-heading)',
          fontSize: mono ? 16 : 24,
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

function AvatarPlaceholder({ name }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div className={styles.avatarPlaceholder}>
      {initials}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
      </div>
    </div>
  )
}
