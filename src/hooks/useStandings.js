import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useStandings(championshipId) {
  const [standings, setStandings] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!championshipId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Get all race_days for this championship
        const { data: raceDays, error: rdErr } = await supabase
          .from('race_days')
          .select('id')
          .eq('championship_id', championshipId)

        if (rdErr) throw rdErr
        const rdIds = raceDays.map(r => r.id)
        if (rdIds.length === 0) { setStandings([]); return }

        // Get all races in those days
        const { data: races, error: rErr } = await supabase
          .from('races')
          .select('id')
          .in('race_day_id', rdIds)

        if (rErr) throw rErr
        const raceIds = races.map(r => r.id)
        if (raceIds.length === 0) { setStandings([]); return }

        // Get all race results
        const { data: results, error: resErr } = await supabase
          .from('race_results')
          .select(`
            driver_id,
            finish_position,
            points_earned,
            is_fastest_lap,
            fastest_lap,
            dnf,
            profiles:driver_id ( display_name, nickname, car_number, car_type )
          `)
          .in('race_id', raceIds)

        if (resErr) throw resErr

        // Get qualifying poles
        const { data: quals } = await supabase
          .from('qualifying_results')
          .select('driver_id, lap_time')
          .in('race_day_id', rdIds)
          .eq('is_pole', true)

        // Aggregate per driver
        const map = {}
        for (const r of results) {
          if (!map[r.driver_id]) {
            map[r.driver_id] = {
              driver_id: r.driver_id,
              profile: r.profiles,
              points: 0,
              wins: 0,
              fast_laps: 0,
              best_lap: null,
              poles: 0,
            }
          }
          const d = map[r.driver_id]
          d.points     += r.points_earned || 0
          if (r.finish_position === 1 && !r.dnf) d.wins++
          if (r.is_fastest_lap) {
            d.fast_laps++
            if (!d.best_lap || r.fastest_lap < d.best_lap) d.best_lap = r.fastest_lap
          }
        }

        // Count poles
        for (const q of (quals || [])) {
          if (map[q.driver_id]) map[q.driver_id].poles++
        }

        const sorted = Object.values(map).sort((a, b) => b.points - a.points)
        if (!cancelled) setStandings(sorted)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [championshipId])

  return { standings, loading, error }
}
