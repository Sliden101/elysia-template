'use client'

import { useEffect, useRef, useState } from 'react'
import { wsSubscribe } from '@libs'
import type { EdenWS } from '@elysiajs/eden'


type MessageItem = {
  id       : number
  content  : string
  createdAt: string
}

type LeaderboardItem = {
  userId  : number
  fullname: string
  group   : string
  rd1     : number
  rd2     : number
  rd3     : number
  total   : number
}

type WSMessage =
  | { type: 'message';          data: MessageItem }
  | { type: 'history';          data: MessageItem[] }
  | { type: 'leaderboard_rd1';  data: LeaderboardItem[] | null }
  | { type: 'leaderboard_rd2';  data: LeaderboardItem[] | null }
  | { type: 'leaderboard_rd3';  data: LeaderboardItem[] | null }
  | { type: 'leaderboard_total';      data:LeaderboardItem[] | null}



export function useWebSocket() {
  const [messages, setMessages]             = useState<MessageItem[]>([])
  const [connected, setConnected]           = useState(false)
  const [leaderboardRd1, setLeaderboardRd1] = useState<LeaderboardItem[]>([])
  const [leaderboardRd2, setLeaderboardRd2] = useState<LeaderboardItem[]>([])
  const [leaderboardRd3, setLeaderboardRd3] = useState<LeaderboardItem[]>([])
  const [leaderboardTotal, setLeaderboardTotal] = useState<LeaderboardItem[]>([])

  const wsRef = useRef<EdenWS | null>(null)

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

      if (data.type === 'history') {
        setMessages(data.data)
      } else if (data.type === 'message') {
        setMessages((prev) => [data.data, ...prev])
      } else if (data.type === 'leaderboard_rd1') {
        setLeaderboardRd1(data.data ?? [])
      } else if (data.type === 'leaderboard_rd2') {
        setLeaderboardRd2(data.data ?? [])
      } else if (data.type === 'leaderboard_rd3') {
        setLeaderboardRd3(data.data ?? [])
      } else if (data.type === 'leaderboard_total'){
        setLeaderboardTotal(data.data ?? [])
      }
        })

        wsRef.current = websocket

        return () => {
            websocket.close()
        }
    }, [])

    const sendMessage = (content: string) => {
        if (wsRef.current && connected) {
            wsRef.current.send(content)
        }
    }

    return { messages, connected, sendMessage , leaderboardRd1,leaderboardRd2,leaderboardRd3, leaderboardTotal}
}