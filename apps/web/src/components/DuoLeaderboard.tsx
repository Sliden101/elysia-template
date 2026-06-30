'use client'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Trophy, Search, X, ChevronUp, ChevronDown, Zap } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { LoadingScreen } from './LoadingScreen'
import { Leaderboard } from '@api/db/schema/schema'

import cfccLogo from '../assets/CFCC.png'

type MainTab = 'overall' | 'rounds' | 'groups'
type RoundTab = 'round1' | 'round2' | 'round3' | 'total'

const rdMap: Record<RoundTab, 'rd1' | 'rd2' | 'rd3' | 'total'> = {
  round1: 'rd1',
  round2: 'rd2',
  round3: 'rd3',
  total: 'total',
}

const tabLabels: Record<RoundTab, string> = {
  round1: 'Round 1',
  round2: 'Round 2',
  round3: 'Round 3',
  total: 'Total',
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors: Record<number, string> = { 1: '#f59e0b', 2: '#94a3b8', 3: '#ea7c2b' }
    return (
      <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: colors[rank] }}>
        <span className="text-white font-black text-sm">{rank}</span>
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
      <span className="text-gray-500 font-bold text-sm">{rank}</span>
    </div>
  )
}

function ScoreCell({ score, topScore }: { score: number; topScore: number }) {
  const [displayed, setDisplayed] = useState(score)
  const prevScore = useRef(score)

  useEffect(() => {
    if (score === prevScore.current) return

    const start = prevScore.current
    const end = score
    const duration = 800
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(start + (end - start) * eased))

      if (progress < 1) requestAnimationFrame(tick)
      else prevScore.current = end
    }

    requestAnimationFrame(tick)
  }, [score])

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Trophy size={16} className="text-amber-500 flex-shrink-0" />
      <span className="font-black text-lg text-blue-900 tracking-tight">
        {displayed.toLocaleString()}
      </span>
    </div>
  )
}

function LeaderboardRow({ entry, rank, isEven, rd, topScore }: {
  entry: Leaderboard
  rank: number
  isEven: boolean
  rd: 'rd1' | 'rd2' | 'rd3' | 'total'
  topScore: number
}) {
  const score = Number(entry[rd])
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`grid grid-cols-[56px_1fr_120px_100px] items-center px-7 py-3.5 border-b border-gray-100 ${
        rank === 1 ? 'bg-amber-50' : rank === 2 ? 'bg-blue-50' : rank === 3 ? 'bg-orange-50' : isEven ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <div><RankBadge rank={rank} /></div>
      <div className="font-semibold text-gray-900 text-sm truncate min-w-0">
        {entry.fullname}
      </div>
      <div>
        {entry.group && (
          <span className="inline-block px-2 py-0.5 rounded border-2 border-orange-400 text-orange-500 text-xs font-extrabold">
            {entry.group}
          </span>
        )}
      </div>
      <ScoreCell score={score} topScore={topScore} />
    </motion.div>
  )
}

function GroupRow({ entry, rank, isEven }: { entry: { name: string; score: number }; rank: number; isEven: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`grid grid-cols-[56px_1fr_100px] items-center px-7 py-3.5 border-b border-gray-100 ${
        rank === 1 ? 'bg-amber-50' : rank === 2 ? 'bg-blue-50' : rank === 3 ? 'bg-orange-50' : isEven ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <div><RankBadge rank={rank} /></div>
      <div className="font-semibold text-gray-900 text-sm">Group {entry.name}</div>
      <ScoreCell score={entry.score} topScore={0} />
    </motion.div>
  )
}



export function DuoLeaderboard() {
  const { leaderboardRd1, leaderboardRd2, leaderboardRd3, leaderboardTotal } = useWebSocket()
  const [isLoading, setIsLoading] = useState(true)
  const [mainTab, setMainTab] = useState<MainTab>('overall')
  const [roundTab, setRoundTab] = useState<RoundTab>('round1')
  const [searchTerm, setSearchTerm] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const dataMap = {
    round1: leaderboardRd1,
    round2: leaderboardRd2,
    round3: leaderboardRd3,
  } as const

  // Overall always shows total from getOverallLeaderboard()
  // Rounds tab uses sub-tab to pick rd1/rd2/rd3 data
  const rd = mainTab === 'overall' ? 'total' : rdMap[roundTab as 'round1' | 'round2' | 'round3']
  const sourceData = mainTab === 'overall' ? leaderboardTotal : (dataMap[roundTab as 'round1' | 'round2' | 'round3'] ?? [])

  const topScore = sourceData.length > 0 ? Math.max(...sourceData.map((e) => Number(e[rd]))) : 0

  const groupData = (() => {
    const groupMap = new Map<string, number>()
    sourceData.forEach((e) => {
      const g = e.group || 'Unassigned'
      groupMap.set(g, (groupMap.get(g) || 0) + Number(e[rd]))
    })
    return Array.from(groupMap.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
  })()

  const displayData = mainTab === 'groups' ? groupData : sourceData
  const isGroupView = mainTab === 'groups'

  const filteredData = searchTerm
    ? displayData.filter((e: any) =>
        (e.fullname ?? e.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayData

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  const scrollUp = () => scrollRef.current?.scrollBy({ top: -300, behavior: 'smooth' })
  const scrollDown = () => scrollRef.current?.scrollBy({ top: 300, behavior: 'smooth' })

  const getBoardTitle = () => {
    if (mainTab === 'groups') return 'Group Rankings'
    if (mainTab === 'overall') return 'Overall Rankings'
    return tabLabels[roundTab] + ' Board'
  }

  if (isLoading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-[920px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black text-blue-900 flex items-center gap-2"
          >
           <Image src={cfccLogo} alt="CFCC" width={200} height={100}  />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-orange-500 font-extrabold">
              <Zap size={13} />
              LIVE NOW
            </span>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2.5 mb-6 flex-wrap justify-center">
          {([
            { id: 'overall', label: 'Overall' },
            { id: 'rounds', label: 'Rounds' },
            { id: 'groups', label: 'Groups' },
          ] as { id: MainTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id as MainTab)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm border-none cursor-pointer transition-all duration-200 ${
                mainTab === tab.id
                  ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/35'
                  : 'bg-white text-gray-400 shadow-sm hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Round Sub-tabs - only visible in Rounds tab */}
        {mainTab === 'rounds' && (
          <div className="flex gap-2 mb-5 justify-center">
            {(['round1', 'round2', 'round3'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoundTab(r)}
                className={`px-5 py-2 rounded-full font-bold text-xs border-2 cursor-pointer transition-all duration-200 ${
                  roundTab === r
                    ? 'border-orange-400 bg-orange-50 text-orange-500'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                }`}
              >
                {tabLabels[r]}
              </button>
            ))}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Card Header */}
          <div className="px-7 pt-5.5 pb-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[30px]">🏆</span>
              <h1 className="m-0 text-2xl font-black text-blue-900">{getBoardTitle()}</h1>
            </div>
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-[34px] py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-blue-900 w-[180px] outline-none focus:border-orange-300 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 p-0 flex"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Header */}
    <div className={`grid ${isGroupView ? 'grid-cols-[56px_1fr_100px]' : 'grid-cols-[56px_1fr_120px_100px]'} px-7 py-2.5 bg-gray-50 border-b border-gray-100`}>
     {(isGroupView
       ? ['RANK', 'GROUP', 'SCORE']
       : ['RANK', 'PLAYER', 'GROUP', 'SCORE'] ).map((col, i, arr) => (
    <span
      key={col}
      className={`text-xs font-extrabold text-gray-400 tracking-wide ${
        i === arr.length - 1 ? 'text-right' : 'text-left'
      }`}
    >
      {col}
    </span>
  ))}
</div>

          {/* Table Body */}
          <div className="relative">
            <div ref={scrollRef} className="max-h-[480px] overflow-y-auto scrollbar-thin">
              {filteredData.length > 0 ? filteredData.map((entry: any, i) => {
                const rank = displayData.findIndex((e: any) => (e.fullname ?? e.name) === (entry.fullname ?? entry.name)) + 1
                return isGroupView ? (
                  <GroupRow key={entry.name} entry={entry} rank={rank} isEven={i % 2 === 0} />
                ) : (
                  <LeaderboardRow key={entry.userId} entry={entry} rank={rank} isEven={i % 2 === 0} rd={rd} topScore={topScore} />
                )
              }) : (
                <div className="text-center py-12 text-gray-400">
                  <Search size={38} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold m-0">No results found</p>
                  <p className="text-sm mt-1">Try a different name</p>
                </div>
              )}
            </div>

            {/* Scroll arrows */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
              <button onClick={scrollUp} className="w-7 h-7 rounded-lg border border-gray-200 bg-white cursor-pointer flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                <ChevronUp size={14} />
              </button>
              <button onClick={scrollDown} className="w-7 h-7 rounded-lg border border-gray-200 bg-white cursor-pointer flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 transition-colors">
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  )
}
