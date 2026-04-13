import { useState, useEffect } from 'react'
import { useLang } from '../contexts/LangContext'
import { useAllRaceDays } from '../hooks/useRaceDay'
import { useAllDrivers } from '../hooks/useDriverProfile'
import { useChampionships, useSeasons } from '../hooks/useChampionships'
import { supabase } from '../lib/supabase'
import { getPoints, formatLapTime } from '../lib/points'
import styles from './Admin.module.css'

const TABS = ['entry', 'drivers', 'season', 'import']

export default function Admin() {
  const { t } = useLang()
  const [tab, setTab] = useState('entry')
  const [toast, setToast] = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className="container">
      <div className={styles.page}>

        <header className={styles.header}>
          <h1 className={styles.title}>{t('admin_title')}</h1>
        </header>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {TABS.map(k => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              className={`${styles.tab} ${tab === k ? styles.tabActive : ''}`}
              onClick={() => setTab(k)}
            >
              {t(`admin_tab_${k}`)}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {tab === 'entry'   && <DataEntryTab   t={t} showToast={showToast} />}
        {tab === 'drivers' && <DriversTab      t={t} showToast={showToast} />}
        {tab === 'season'  && <SeasonTab       t={t} showToast={showToast} />}
        {tab === 'import'  && <ImportTab       t={t} showToast={showToast} />}

        {/* Toast */}
        {toast && (
          <div className="toast-container">
            <div className={`toast toast-${toast.type}`}>
              {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  DATA ENTRY TAB
// ═══════════════════════════════════════════════════════
function DataEntryTab({ t, showToast }) {
  const { raceDays }             = useAllRaceDays()
  const { drivers }              = useAllDrivers()
  const [selectedDay, setSelectedDay] = useState('')
  const [qualTimes, setQualTimes]     = useState({}) // { driverId: lapTimeStr }
  const [race1, setRace1]             = useState({}) // { driverId: { pos, dnf } }
  const [race2, setRace2]             = useState({}) // { driverId: { pos, dnf } }
  const [saving, setSaving]           = useState(false)

  const raceDay = raceDays.find(r => r.id === selectedDay)

  // Init state when day changes
  useEffect(() => {
    if (!selectedDay) return
    const init = {}
    drivers.forEach(d => { init[d.id] = '' })
    setQualTimes(init)
    const initR = {}
    drivers.forEach((d, i) => { initR[d.id] = { pos: '', dnf: false } })
    setRace1(initR)
    setRace2(initR)
  }, [selectedDay, drivers.length])

  async function saveQualifying() {
    if (!selectedDay) return
    setSaving(true)
    try {
      // Sort by time to get grid positions
      const entries = drivers
        .filter(d => qualTimes[d.id] && !isNaN(parseFloat(qualTimes[d.id])))
        .map(d => ({ driver_id: d.id, lap_time: parseFloat(qualTimes[d.id]) }))
        .sort((a, b) => a.lap_time - b.lap_time)

      const rows = entries.map((e, i) => ({
        race_day_id:   selectedDay,
        driver_id:     e.driver_id,
        lap_time:      e.lap_time,
        grid_position: i + 1,
        is_pole:       i === 0,
      }))

      const { error } = await supabase
        .from('qualifying_results')
        .upsert(rows, { onConflict: 'race_day_id,driver_id' })

      if (error) throw error

      // Update race_day status
      await supabase.from('race_days').update({ status: 'qualifying' }).eq('id', selectedDay)

      showToast(t('admin_saved'))
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function saveRaceResults(raceNum, resultState) {
    if (!selectedDay) return
    setSaving(true)
    try {
      // Get race id
      const { data: races } = await supabase
        .from('races')
        .select('id')
        .eq('race_day_id', selectedDay)
        .eq('race_number', raceNum)
        .single()

      let raceId = races?.id
      if (!raceId) {
        const { data: newRace } = await supabase
          .from('races')
          .insert({ race_day_id: selectedDay, race_number: raceNum, status: 'completed' })
          .select('id')
          .single()
        raceId = newRace.id
      } else {
        await supabase.from('races').update({ status: 'completed' }).eq('id', raceId)
      }

      const rows = drivers
        .filter(d => resultState[d.id]?.pos || resultState[d.id]?.dnf)
        .map(d => {
          const pos  = parseInt(resultState[d.id]?.pos) || null
          const dnf  = resultState[d.id]?.dnf || false
          return {
            race_id:         raceId,
            driver_id:       d.id,
            finish_position: pos,
            points_earned:   dnf ? 0 : getPoints(pos),
            dnf,
          }
        })

      // Mark fastest lap
      const timeSorted = rows
        .filter(r => !r.dnf && r.finish_position)
        .sort((a, b) => (a.finish_position - b.finish_position))

      const { error } = await supabase
        .from('race_results')
        .upsert(rows, { onConflict: 'race_id,driver_id' })

      if (error) throw error

      // Update race_day status
      await supabase.from('race_days').update({ status: 'completed' }).eq('id', selectedDay)

      showToast(t('admin_saved'))
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.panel}>
      {/* Select race day */}
      <div className="field">
        <label className="label">{t('admin_select_day')}</label>
        <select className="input" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
          <option value="">— {t('admin_select_day')} —</option>
          {raceDays.map(rd => (
            <option key={rd.id} value={rd.id}>
              {rd.date} — {t('schedule_round')} {rd.round_number} ({rd.status})
            </option>
          ))}
        </select>
      </div>

      {selectedDay && (
        <>
          {/* Qualifying */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('admin_qualifying')}</h2>
            <div className={styles.driverGrid}>
              {drivers.map(d => (
                <div key={d.id} className={styles.driverRow}>
                  <span className={styles.driverRowName}>
                    #{d.car_number} {d.nickname || d.display_name}
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    className={`input ${styles.timeInput}`}
                    placeholder="00.000"
                    value={qualTimes[d.id] || ''}
                    onChange={e => setQualTimes(p => ({ ...p, [d.id]: e.target.value }))}
                    aria-label={`${t('admin_lap_time')} ${d.display_name}`}
                  />
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={saveQualifying}
              disabled={saving}
            >
              {saving ? t('loading') : t('admin_save_qualifying')}
            </button>
            <p className={styles.hint}>{t('admin_points_auto')}</p>
          </section>

          {/* Race 1 */}
          <RaceResultsSection
            label={t('admin_race1')}
            state={race1}
            setState={setRace1}
            drivers={drivers}
            onSave={() => saveRaceResults(1, race1)}
            saving={saving}
            t={t}
          />

          {/* Race 2 */}
          <RaceResultsSection
            label={t('admin_race2')}
            state={race2}
            setState={setRace2}
            drivers={drivers}
            onSave={() => saveRaceResults(2, race2)}
            saving={saving}
            t={t}
          />
        </>
      )}
    </div>
  )
}

function RaceResultsSection({ label, state, setState, drivers, onSave, saving, t }) {
  function update(driverId, field, value) {
    setState(p => ({ ...p, [driverId]: { ...p[driverId], [field]: value } }))
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{label}</h2>
      <div className={styles.driverGrid}>
        {drivers.map(d => (
          <div key={d.id} className={styles.driverRow}>
            <span className={styles.driverRowName}>
              #{d.car_number} {d.nickname || d.display_name}
            </span>
            <div className={styles.raceInputs}>
              <input
                type="number"
                min="1"
                max="20"
                className={`input ${styles.posInput}`}
                placeholder={t('admin_position')}
                value={state[d.id]?.pos || ''}
                onChange={e => update(d.id, 'pos', e.target.value)}
                disabled={state[d.id]?.dnf}
                aria-label={`${t('admin_position')} ${d.display_name}`}
              />
              <label className={styles.dnfLabel}>
                <input
                  type="checkbox"
                  checked={state[d.id]?.dnf || false}
                  onChange={e => update(d.id, 'dnf', e.target.checked)}
                />
                {t('admin_dnf')}
              </label>
              {state[d.id]?.pos && !state[d.id]?.dnf && (
                <span className={styles.pointsPreview}>
                  {getPoints(parseInt(state[d.id].pos))} pts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onSave} disabled={saving}>
        {saving ? t('loading') : t('admin_save_race')}
      </button>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
//  DRIVERS TAB
// ═══════════════════════════════════════════════════════
function DriversTab({ t, showToast }) {
  const { drivers, loading } = useAllDrivers()
  const [editing, setEditing] = useState(null) // null | 'new' | driverObj
  const [form, setForm]       = useState({})
  const [saving, setSaving]   = useState(false)

  function openNew() {
    setForm({ display_name: '', nickname: '', car_number: '', car_type: 'stock_plastica', role: 'driver' })
    setEditing('new')
  }

  function openEdit(d) {
    setForm({ ...d })
    setEditing(d)
  }

  async function saveDriver() {
    setSaving(true)
    try {
      if (editing === 'new') {
        // For new drivers: must have auth user first — we insert profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id:           form.id || undefined,
            display_name: form.display_name,
            nickname:     form.nickname || null,
            car_number:   form.car_number ? parseInt(form.car_number) : null,
            car_type:     form.car_type || null,
            role:         form.role || 'driver',
          })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: form.display_name,
            nickname:     form.nickname || null,
            car_number:   form.car_number ? parseInt(form.car_number) : null,
            car_type:     form.car_type || null,
            role:         form.role || 'driver',
          })
          .eq('id', editing.id)
        if (error) throw error
      }
      showToast(t('admin_saved'))
      setEditing(null)
      window.location.reload()
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.driversHeader}>
        <h2 className={styles.sectionTitle}>{t('admin_drivers_title')}</h2>
        <button className="btn btn-primary" onClick={openNew}>{t('admin_add_driver')}</button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
      ) : (
        <div className={styles.driverList}>
          {drivers.map(d => (
            <div key={d.id} className={styles.driverCard}>
              <div className={styles.driverCardLeft}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)' }}>
                  #{d.car_number}
                </span>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', fontSize: 15 }}>
                    {d.display_name}
                  </p>
                  {d.nickname && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent3)' }}>
                      "{d.nickname}"
                    </p>
                  )}
                </div>
                <span className="badge badge-muted">{d.car_type}</span>
                {d.role === 'admin' && <span className="badge badge-orange">admin</span>}
              </div>
              <button className="btn btn-secondary" onClick={() => openEdit(d)}>
                {t('edit')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit / New modal */}
      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog">
            <h3 className={styles.modalTitle}>
              {editing === 'new' ? t('admin_add_driver') : t('admin_edit_driver')}
            </h3>

            {editing === 'new' && (
              <div className="field">
                <label className="label">UUID (auth.users ID)</label>
                <input className="input" value={form.id || ''} onChange={e => setForm(p => ({ ...p, id: e.target.value }))} placeholder="xxxxxxxx-xxxx-..." />
              </div>
            )}

            <div className="field">
              <label className="label">{t('admin_name')}</label>
              <input className="input" value={form.display_name || ''} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} required />
            </div>
            <div className="field">
              <label className="label">{t('admin_nickname')} <span style={{ color: 'var(--text3)', fontSize: 11 }}>({t('optional')})</span></label>
              <input className="input" value={form.nickname || ''} onChange={e => setForm(p => ({ ...p, nickname: e.target.value }))} />
            </div>
            <div className={styles.twoFields}>
              <div className="field">
                <label className="label">{t('admin_car_number')}</label>
                <input type="number" className="input" value={form.car_number || ''} onChange={e => setForm(p => ({ ...p, car_number: e.target.value }))} />
              </div>
              <div className="field">
                <label className="label">{t('admin_car_type')}</label>
                <select className="input" value={form.car_type || ''} onChange={e => setForm(p => ({ ...p, car_type: e.target.value }))}>
                  <option value="stock_plastica">{t('car_stock_plastica')}</option>
                  <option value="modif">{t('car_modif')}</option>
                  <option value="pancar">{t('car_pancar')}</option>
                  <option value="touring">{t('car_touring')}</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">{t('admin_role')}</label>
              <select className="input" value={form.role || 'driver'} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>{t('admin_cancel')}</button>
              <button className="btn btn-primary" onClick={saveDriver} disabled={saving || !form.display_name}>
                {saving ? t('loading') : t('admin_save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  SEASON TAB
// ═══════════════════════════════════════════════════════
function SeasonTab({ t, showToast }) {
  const { seasons, loading } = useSeasons()
  const { championships }    = useChampionships()
  const [newSeason, setNewSeason] = useState({ name: '', year: new Date().getFullYear() })
  const [saving, setSaving]       = useState(false)

  async function createSeason() {
    if (!newSeason.name) return
    setSaving(true)
    try {
      const { data: s, error: sErr } = await supabase
        .from('seasons')
        .insert({ name: newSeason.name, year: parseInt(newSeason.year), active: false })
        .select('id')
        .single()
      if (sErr) throw sErr

      // Create 4 championships
      const champs = [
        { type: 'Stock Plástica', direction: 'Horario',      order_index: 1 },
        { type: 'Stock Plástica', direction: 'Anti-horario', order_index: 2 },
        { type: 'Modif/Pancar',   direction: 'Horario',      order_index: 3 },
        { type: 'Modif/Touring',  direction: 'Anti-horario', order_index: 4 },
      ].map(c => ({ ...c, season_id: s.id, active: false }))

      const { error: cErr } = await supabase.from('championships').insert(champs)
      if (cErr) throw cErr

      showToast(t('admin_saved'))
      window.location.reload()
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function setActiveChamp(champId) {
    setSaving(true)
    try {
      // Deactivate all, then activate selected
      await supabase.from('championships').update({ active: false }).neq('id', champId)
      await supabase.from('championships').update({ active: true }).eq('id', champId)
      showToast(t('admin_saved'))
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function setActiveSeason(seasonId) {
    setSaving(true)
    try {
      await supabase.from('seasons').update({ active: false }).neq('id', seasonId)
      await supabase.from('seasons').update({ active: true }).eq('id', seasonId)
      showToast(t('admin_saved'))
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('admin_new_season')}</h2>
        <div className={styles.twoFields}>
          <div className="field">
            <label className="label">{t('admin_season_name')}</label>
            <input className="input" value={newSeason.name} onChange={e => setNewSeason(p => ({ ...p, name: e.target.value }))} placeholder="Temporada 2026" />
          </div>
          <div className="field">
            <label className="label">{t('admin_season_year')}</label>
            <input type="number" className="input" value={newSeason.year} onChange={e => setNewSeason(p => ({ ...p, year: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={createSeason} disabled={saving || !newSeason.name}>
          {saving ? t('loading') : t('admin_save')}
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('admin_season_title')}</h2>
        {loading ? <div className="skeleton" style={{ height: 80 }} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {seasons.map(s => (
              <div key={s.id} className={styles.seasonRow}>
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase' }}>{s.name}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{s.year}</p>
                </div>
                {s.active
                  ? <span className="badge badge-yellow">ACTIVA</span>
                  : <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setActiveSeason(s.id)}>Activar</button>
                }
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('admin_set_active_champ')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {championships.map(c => (
            <div key={c.id} className={styles.seasonRow}>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, textTransform: 'uppercase', fontSize: 14 }}>
                  {c.type} — {c.direction}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{c.seasons?.name}</p>
              </div>
              {c.active
                ? <span className="badge badge-yellow">ACTIVO</span>
                : <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setActiveChamp(c.id)}>Activar</button>
              }
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
//  IMPORT TAB
// ═══════════════════════════════════════════════════════
function ImportTab({ t, showToast }) {
  const { raceDays }    = useAllRaceDays()
  const { drivers }     = useAllDrivers()
  const [raw, setRaw]   = useState('')
  const [parsed, setParsed]       = useState([])
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedRace, setSelectedRace] = useState(1)
  const [saving, setSaving] = useState(false)

  function parseLapTimes() {
    const lines = raw.split(/[\n,]+/).map(l => l.trim()).filter(Boolean)
    const result = []

    for (const line of lines) {
      const parts = line.split(/[,\s]+/)
      if (parts.length >= 2) {
        // Format: DRIVER_NAME TIME
        const time   = parseFloat(parts[parts.length - 1])
        const name   = parts.slice(0, -1).join(' ')
        const driver = drivers.find(d =>
          d.display_name.toLowerCase().includes(name.toLowerCase()) ||
          d.nickname?.toLowerCase().includes(name.toLowerCase())
        )
        if (!isNaN(time)) {
          result.push({ raw: line, time, driverId: driver?.id || '', driverName: driver?.display_name || name })
        }
      } else {
        const time = parseFloat(parts[0])
        if (!isNaN(time)) result.push({ raw: line, time, driverId: '', driverName: '' })
      }
    }

    setParsed(result)
  }

  async function confirmImport() {
    if (!selectedDay || parsed.length === 0) return
    setSaving(true)
    try {
      const { data: races } = await supabase
        .from('races')
        .select('id')
        .eq('race_day_id', selectedDay)
        .eq('race_number', selectedRace)
        .single()

      let raceId = races?.id
      if (!raceId) {
        const { data: newRace } = await supabase
          .from('races')
          .insert({ race_day_id: selectedDay, race_number: parseInt(selectedRace), status: 'upcoming' })
          .select('id')
          .single()
        raceId = newRace.id
      }

      const rows = parsed
        .filter(p => p.driverId)
        .flatMap((p, i) =>
          Array.from({ length: 1 }, (_, j) => ({
            race_id:    raceId,
            driver_id:  p.driverId,
            lap_number: i + 1,
            lap_time:   p.time,
          }))
        )

      const { error } = await supabase.from('lap_times').insert(rows)
      if (error) throw error

      showToast(t('admin_saved'))
      setRaw('')
      setParsed([])
    } catch (e) {
      showToast(t('admin_error') + ': ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function updateParsedDriver(idx, driverId) {
    const driver = drivers.find(d => d.id === driverId)
    setParsed(p => p.map((x, i) => i === idx ? { ...x, driverId, driverName: driver?.display_name || '' } : x))
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.sectionTitle}>{t('admin_import_title')}</h2>

      <div className={styles.twoFields}>
        <div className="field">
          <label className="label">{t('admin_select_day')}</label>
          <select className="input" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
            <option value="">—</option>
            {raceDays.map(rd => (
              <option key={rd.id} value={rd.id}>{rd.date} R{rd.round_number}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label">{t('schedule_races')}</label>
          <select className="input" value={selectedRace} onChange={e => setSelectedRace(e.target.value)}>
            <option value={1}>Carrera 1</option>
            <option value={2}>Carrera 2</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label className="label">{t('admin_import_hint').split('\n')[0]}</label>
        <textarea
          className="input"
          rows={8}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={t('admin_import_hint')}
          style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }}
        />
      </div>

      <button className="btn btn-secondary" onClick={parseLapTimes} disabled={!raw.trim()}>
        {t('admin_import_parse')}
      </button>

      {parsed.length > 0 && (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: 16 }}>{t('admin_import_preview')}</h3>
          <div className={styles.importPreview}>
            {parsed.map((p, i) => (
              <div key={i} className={styles.importRow}>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--text3)', width: 40 }}>{i + 1}.</span>
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--accent3)', width: 80 }}>{p.time.toFixed(3)}</span>
                <select
                  className="input"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 12, minHeight: 36 }}
                  value={p.driverId}
                  onChange={e => updateParsedDriver(i, e.target.value)}
                >
                  <option value="">— {t('admin_driver')} —</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>#{d.car_number} {d.display_name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={confirmImport}
            disabled={saving || !selectedDay || parsed.every(p => !p.driverId)}
          >
            {saving ? t('loading') : t('admin_import_confirm')}
          </button>
        </>
      )}
    </div>
  )
}
