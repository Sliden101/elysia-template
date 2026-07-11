'use client'

import { useEffect, useState } from 'react'

type LeaderboardItem = {
  userId: string
  fullname: string
  group: string
  score?: number
  total?: number
}

type LeaderboardState = {
  leaderboardRd1: LeaderboardItem[]
  leaderboardRd2: LeaderboardItem[]
  leaderboardRd3: LeaderboardItem[]
  leaderboardPhysical: LeaderboardItem[]
  leaderboardTotal: LeaderboardItem[]
  loading: boolean
  error: string | null
}

const ROUNDS = ['rd1', 'rd2', 'rd3', 'physical', 'total'] as const

export function useLeaderboard(): LeaderboardState {
  const [state, setState] = useState<LeaderboardState>({
    leaderboardRd1: [],
    leaderboardRd2: [],
    leaderboardRd3: [],
    leaderboardPhysical: [],
    leaderboardTotal: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const results = await Promise.all(
          ROUNDS.map((round) =>
            fetch(`/api/leaderboard?round=${round}`).then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status} for ${round}`)
              return r.json()
            })
          )
        )

        if (cancelled) return

        setState({
          leaderboardRd1: results[0],
          leaderboardRd2: results[1],
          leaderboardRd3: results[2],
          leaderboardPhysical: results[3],
          leaderboardTotal: results[4],
          loading: false,
          error: null,
        })
      } catch (e) {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to load leaderboard',
        }))
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return state
}
