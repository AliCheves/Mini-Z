import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useNextRaceDay() {
  const [raceDay, setRaceDay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data, error: e } = await supabase
          .from('race_days')
          .select(`
            *,
            championships ( type, direction, order_index )
          `)
          .in('status', ['upcoming', 'qualifying', 'racing'])
          .order('date', { ascending: true })
          .limit(1)
          .single()
        if (!cancelled) { setRaceDay(e ? null : data); setError(e ? e.message : null) }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { raceDay, loading, error }
}

export function useRaceDayGrid(raceDayId) {
  const [grid, setGrid]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!raceDayId) { setLoading(false); return }
    let cancelled = false
    async function load() {
      try {
        const { data, error: e } = await supabase
          .from('qualifying_results')
          .select(`
            grid_position, is_pole, lap_time,
            profiles:driver_id ( display_name, nickname, car_number, car_type )
          `)
          .eq('race_day_id', raceDayId)
          .order('grid_position', { ascending: true })
        if (!cancelled) { setGrid(e ? [] : (data || [])); setError(e?.message) }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [raceDayId])

  return { grid, loading, error }
}

export function useAllRaceDays() {
  const [raceDays, setRaceDays] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data, error: e } = await supabase
          .from('race_days')
          .select(`
            *,
            championships ( type, direction, order_index, season_id,
              seasons ( name, year )
            ),
            races ( id, race_number, status )
          `)
          .order('date', { ascending: true })
        if (!cancelled) { setRaceDays(e ? [] : (data || [])); setError(e?.message) }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { raceDays, loading, error }
}
