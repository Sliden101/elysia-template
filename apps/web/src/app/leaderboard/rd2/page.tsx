'use client'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { LeaderboardTable } from '@web/components/LeaderboardTable'
import { Podium } from '@web/components/Podium'
import { SearchBar } from '@web/components/searchBar'
import { useState } from 'react'

export default function Rd2() {
  const { leaderboardRd2 } = useWebSocket()
  const [searchName, setSearchName] = useState("")
  
    const filtered = searchName
      ? leaderboardRd2.filter((e) => e.fullname.toLowerCase().includes(searchName.toLowerCase()))
      : leaderboardRd2

  return (
    <>
      <Podium data={leaderboardRd2} rd="rd2" />
      <SearchBar onSearch={setSearchName} />
      <LeaderboardTable data={filtered} rd="rd2" />
    </>
  )
}