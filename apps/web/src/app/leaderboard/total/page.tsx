'use client'
import { useState } from 'react'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { LeaderboardTable } from '@web/components/LeaderboardTable'
import { Podium } from '@web/components/Podium'
import { SearchBar } from '@web/components/searchBar'

export default function Total() {
  const { leaderboardTotal } = useWebSocket()
   const [searchName, setSearchName] = useState("")

  const filtered = searchName
    ? leaderboardTotal.filter((e) => e.fullname.toLowerCase().includes(searchName.toLowerCase()))
    : leaderboardTotal

  return (
    <>
      <Podium data={leaderboardTotal} rd="total" />
      <SearchBar onSearch={setSearchName} />
      <LeaderboardTable data={filtered} rd="total" />
    </>
  )
}