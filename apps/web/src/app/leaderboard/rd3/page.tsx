'use client'
import { useState } from 'react'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { LeaderboardTable } from '@web/components/LeaderboardTable'
import { Podium } from '@web/components/Podium'
import { SearchBar } from '@web/components/searchBar'

export default function Rd3() {
  const { leaderboardRd3 } = useWebSocket()
  const [searchName, setSearchName] = useState("")

  const filtered = searchName
    ? leaderboardRd3.filter((e) => e.fullname.toLowerCase().includes(searchName.toLowerCase()))
    : leaderboardRd3

  return (
    <>
      <Podium data={leaderboardRd3} rd="rd3" />
      <SearchBar onSearch={setSearchName} />
      <LeaderboardTable data={filtered} rd="rd3" />
    </>
  )
}