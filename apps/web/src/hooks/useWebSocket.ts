'use client'

import { useEffect, useRef, useState } from 'react'
import { wsSubscribe } from '@libs'

type MessageItem = {
  id       : number
  content  : string
  createdAt: string
}

type LeaderboardItem = {
  userId  : string
  fullname: string
  idnumber: string
  group   : string
  rd1     : number
  rd2     : number
  rd3     : number
  physical: number
  total   : number
}

type WSMessage =
  | { type: 'leaderboard_rd1';  data: LeaderboardItem[] | null }
  | { type: 'leaderboard_rd2';  data: LeaderboardItem[] | null }
  | { type: 'leaderboard_rd3';  data: LeaderboardItem[] | null }
  | { type: 'leaderboard_physical'; data: LeaderboardItem[] | null }
  | { type: 'leaderboard_total';      data:LeaderboardItem[] | null }



export function useWebSocket() {
  const [connected, setConnected]           = useState(false)
  const [leaderboardRd1, setLeaderboardRd1] = useState<LeaderboardItem[]>([])
  const [leaderboardRd2, setLeaderboardRd2] = useState<LeaderboardItem[]>([])
  const [leaderboardRd3, setLeaderboardRd3] = useState<LeaderboardItem[]>([])
  const [leaderboardPhysical, setLeaderboardPhysical] = useState<LeaderboardItem[]>([])
  const [leaderboardTotal, setLeaderboardTotal] = useState<LeaderboardItem[]>([])

  const wsRef = useRef<any>(null)

    useEffect(() => {
        const websocket = wsSubscribe()

        websocket.on('open', () => {
            setConnected(true)
            console.log('WebSocket connected')
        })

        websocket.on('close', () => {
            setConnected(false)
            console.log('WebSocket disconnected')
        })

        websocket.subscribe((raw) => {
             const data = raw.data as WSMessage

        if (data.type === 'leaderboard_rd1') {
        setLeaderboardRd1(data.data ?? [])
      } else if (data.type === 'leaderboard_rd2') {
        setLeaderboardRd2(data.data ?? [])
      } else if (data.type === 'leaderboard_rd3') {
        setLeaderboardRd3(data.data ?? [])
      } else if (data.type === 'leaderboard_physical') {
        setLeaderboardPhysical(data.data ?? [])
      } else if (data.type === 'leaderboard_total'){
        setLeaderboardTotal(data.data ?? [])
      }
        })

        wsRef.current = websocket

        return () => {
            websocket.close()
        }
    }, [])


    return { connected, leaderboardRd1,leaderboardRd2,leaderboardRd3, leaderboardPhysical, leaderboardTotal}
}
