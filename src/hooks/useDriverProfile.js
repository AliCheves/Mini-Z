import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDriverProfile(driverId) {
  const [profile, setProfile]   = useState(null)
  const [stats, setStats]       = useState(null)
  const [history, setHistory]   = useState([])
  const [lapData, setLapData]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!driverId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [profileRes, resultsRes, qualsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', driverId).single(),
          supabase.from('race_results').select(`
            finish_position, points_earned, is_fastest_lap, fastest_lap, dnf,
            races:race_id (
              race_number,
              race_days:race_day_id (
                date, round_number,
                championships:championship_id ( type, direction, order_index )
              )
            )
          `).eq('driver_id', driverId).order('created_at', { ascending: false }),
          supabase.from('qualifying_results').select('is_pole').eq('driver_id', driverId).eq('is_pole', true),
        ])

        if (cancelled) return
        if (profileRes.error) throw profileRes.error

        setProfile(profileRes.data)

        const results = resultsRes.data || []
        const poles   = qualsRes.data?.length ?? 0

        const totalPoints  = results.reduce((s, r) => s + (r.points_earned || 0), 0)
        const wins         = results.filter(r => r.finish_position === 1 && !r.dnf).length
        const fastLaps     = results.filter(r => r.is_fastest_lap).length
        const allLapTimes  = results.filter(r => r.fastest_lap).map(r => parseFloat(r.fastest_lap))
        const bestLap      = allLapTimes.length ? Math.min(...allLapTimes) : null

        setStats({ totalPoints, wins, poles, fastLaps, bestLap })
        setHistory(results)

        // Lap progression: fastest_lap per round, grouped by championship
        const grouped = {}
        for (const r of results) {
          if (!r.fastest_lap || !r.races?.race_days) continue
          const rd  = r.races.race_days
          const champ = rd.championships?.type + ' — ' + rd.championships?.direction
          if (!grouped[champ]) grouped[champ] = []
          grouped[champ].push({
            round: rd.round_number,
            date:  rd.date,
            lap:   parseFloat(r.fastest_lap),
          })
        }
        setLapData(grouped)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [driverId])

  return { profile, stats, history, lapData, loading, error }
}

export function useAllDrivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('profiles').select('*').order('car_number')
      .then(({ data, error: e }) => {
        if (!cancelled) { setDrivers(data || []); setError(e?.message); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [])

  return { drivers, loading, error, refetch: () => {} }
}
