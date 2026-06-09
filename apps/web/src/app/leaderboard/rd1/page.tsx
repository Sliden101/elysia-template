'use client'
import { useState } from 'react'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { LeaderboardTable } from '@web/components/LeaderboardTable'
import { Podium } from '@web/components/Podium'
import { SearchBar } from '@web/components/searchBar'

export default function Rd1() {
  const { leaderboardRd1 } = useWebSocket()
  const [searchName, setSearchName] = useState("")

  const filtered = searchName
    ? leaderboardRd1.filter((e) => e.fullname.toLowerCase().includes(searchName.toLowerCase()))
    : leaderboardRd1

  return (
    <>
      <Podium data={leaderboardRd1} rd="rd1" />
      <SearchBar onSearch={setSearchName} />
      <LeaderboardTable data={filtered} rd="rd1" />
    </>
  )
}