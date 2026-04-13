import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useChampionships(seasonId) {
  const [championships, setChampionships] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let query = supabase
          .from('championships')
          .select('*, seasons(name,year)')
          .order('order_index')
        if (seasonId) query = query.eq('season_id', seasonId)

        const { data, error: e } = await query
        if (!cancelled) { setChampionships(data || []); setError(e?.message) }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [seasonId])

  return { championships, loading, error }
}

export function useActiveChampionship() {
  const [championship, setChampionship] = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('championships')
      .select('*, seasons(name,year,active)')
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (!cancelled) { setChampionship(data); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [])

  return { championship, loading }
}

export function useSeasons() {
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase.from('seasons').select('*').order('year', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) { setSeasons(data || []); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [])

  return { seasons, loading }
}
