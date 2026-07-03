'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, Search, X, Zap, Users, BarChart3, Timer } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { LoadingScreen } from './LoadingScreen'
import { Leaderboard } from '@api/db/schema/schema'

import cfccLogo from '../assets/CFCC.png'

type MainTab = 'overall' | 'rounds' | 'groups'
type RoundTab = 'rd1' | 'rd2' | 'rd3' | 'physical'

const ROUND_CONFIG: Record<RoundTab, { label: string; color: string; borderColor: string }> = {
  rd1: { label: 'Round 1', color: 'text-emerald-600', borderColor: 'border-emerald-500' },
  rd2: { label: 'Round 2', color: 'text-blue-600', borderColor: 'border-blue-500' },
  rd3: { label: 'Round 3', color: 'text-purple-600', borderColor: 'border-purple-500' },
  physical: { label: 'Physical', color: 'text-rose-600', borderColor: 'border-rose-500' },
}

// Podium Component for Top 3 - RECTANGULAR
function Podium({ data, rd }: { data: Leaderboard[]; rd: 'rd1' | 'rd2' | 'rd3' | 'physical' | 'total' }) {
  if (data.length === 0) return null

  const [first, second, third] = [data[0], data[1], data[2]]

  return (
    <div className="mb-8">
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {/* 2nd Place */}
        {second && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-slate-100 border-2 border-slate-300 px-4 sm:px-6 py-4 sm:py-6 w-24 sm:w-32 shadow-md">
              <span className="text-2xl sm:text-3xl block text-center mb-2">🥈</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 text-center truncate max-w-full">
                {second.fullname}
              </p>
              <p className="text-xs sm:text-sm font-black text-slate-600 text-center mt-1">
                {Number(second[rd]).toLocaleString()}
              </p>
            </div>
            <div className="w-full h-4 bg-slate-400" />
          </motion.div>
        )}

        {/* 1st Place */}
        {first && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-amber-100 border-2 border-amber-400 px-4 sm:px-6 py-6 sm:py-8 w-28 sm:w-36 shadow-lg"
            >
              <span className="text-3xl sm:text-4xl block text-center mb-2">🥇</span>
              <p className="text-sm sm:text-base font-black text-amber-900 text-center truncate max-w-full">
                {first.fullname}
              </p>
              <p className="text-sm sm:text-lg font-black text-amber-600 text-center mt-1">
                {Number(first[rd]).toLocaleString()}
              </p>
            </motion.div>
            <div className="w-full h-6 bg-amber-500" />
          </motion.div>
        )}

        {/* 3rd Place */}
        {third && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="bg-orange-100 border-2 border-orange-400 px-4 sm:px-6 py-4 sm:py-6 w-24 sm:w-32 shadow-md">
              <span className="text-2xl sm:text-3xl block text-center mb-2">🥉</span>
              <p className="text-xs sm:text-sm font-bold text-orange-900 text-center truncate max-w-full">
                {third.fullname}
              </p>
              <p className="text-xs sm:text-sm font-black text-orange-600 text-center mt-1">
                {Number(third[rd]).toLocaleString()}
              </p>
            </div>
            <div className="w-full h-4 bg-orange-500" />
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Rank Badge Component - RECTANGULAR
function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: 'bg-amber-400 text-white border-amber-500',
    2: 'bg-slate-400 text-white border-slate-500',
    3: 'bg-orange-400 text-white border-orange-500',
  }

  if (rank <= 3) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`w-10 h-10 flex items-center justify-center border-2 font-black text-lg shadow-sm ${styles[rank]}`}
      >
        {rank}
      </motion.div>
    )
  }

  return (
    <div className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center">
      <span className="text-slate-500 font-bold">{rank}</span>
    </div>
  )
}

// Score Bar Component
function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-orange-500"
        />
      </div>
      <span className="font-black text-slate-700 min-w-[60px] text-right">
        {score.toLocaleString()}
      </span>
    </div>
  )
}

// Leaderboard Row Component - RECTANGULAR with Group column
function LeaderboardRow({
  entry,
  rank,
  rd,
  maxScore,
}: {
  entry: Leaderboard
  rank: number
  rd: 'rd1' | 'rd2' | 'rd3' | 'physical' | 'total'
  maxScore: number
}) {
  const score = Number(entry[rd])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.03 }}
      className={`grid grid-cols-[60px_1fr_80px_140px] sm:grid-cols-[70px_1fr_100px_200px] items-center px-4 sm:px-6 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors ${
        rank <= 3 ? 'bg-amber-50/50' : rank % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
      }`}
    >
      <RankBadge rank={rank} />

      <div className="px-3 sm:px-4 min-w-0">
        <p className="font-bold text-slate-800 truncate">{entry.fullname}</p>
      </div>

      <div className="px-2">
        {entry.group ? (
          <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2 py-1">
            {entry.group}
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </div>

      <div className="px-2">
        <ScoreBar score={score} maxScore={maxScore} />
      </div>
    </motion.div>
  )
}

// Group Row Component - RECTANGULAR
function GroupRow({
  entry,
  rank,
}: {
  entry: { name: string; score: number }
  rank: number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.03 }}
      className={`grid grid-cols-[60px_1fr_140px] sm:grid-cols-[70px_1fr_200px] items-center px-4 sm:px-6 py-3 border-b border-slate-200 hover:bg-slate-50 transition-colors ${
        rank % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
      }`}
    >
      <RankBadge rank={rank} />
      <div className="px-3 sm:px-4">
        <p className="font-bold text-slate-800">Group {entry.name}</p>
      </div>
      <div className="px-2 text-right">
        <span className="font-black text-slate-700">
          {entry.score.toLocaleString()}
        </span>
      </div>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 text-center"
    >
      <div className="w-20 h-20 bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto mb-4">
        <Search className="w-10 h-10 text-slate-400" />
      </div>
      <p className="text-slate-600 font-bold text-lg">No results found</p>
      <p className="text-slate-400 mt-1">
        No matches for &quot;<span className="text-slate-600">{searchTerm}</span>&quot;
      </p>
    </motion.div>
  )
}

// Main Component
export function DuoLeaderboard() {
  const { connected, leaderboardRd1, leaderboardRd2, leaderboardRd3, leaderboardPhysical, leaderboardTotal } =
    useWebSocket()

  const hasData = [leaderboardRd1, leaderboardRd2, leaderboardRd3, leaderboardPhysical, leaderboardTotal].some(
    (arr) => arr.length > 0
  )
  const isLoading = !connected || !hasData

  const [mainTab, setMainTab] = useState<MainTab>('overall')
  const [roundTab, setRoundTab] = useState<RoundTab>('rd1')
  const [searchTerm, setSearchTerm] = useState('')

  // Data mapping
  const roundDataMap = {
    rd1: leaderboardRd1,
    rd2: leaderboardRd2,
    rd3: leaderboardRd3,
    physical: leaderboardPhysical,
  }

  const currentRd = mainTab === 'overall' ? 'total' : roundTab
  const sourceData = mainTab === 'overall' ? leaderboardTotal : roundDataMap[roundTab]

  // Group calculations
  const groupData = useMemo(() => {
    if (mainTab !== 'groups') return []

    const groupMap = new Map<string, number>()
    sourceData.forEach((entry) => {
      const g = entry.group || 'Unassigned'
      groupMap.set(g, (groupMap.get(g) || 0) + Number(entry[currentRd]))
    })

    return Array.from(groupMap.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
  }, [sourceData, currentRd, mainTab])

  // Filter and sort
  const displayData = mainTab === 'groups' ? groupData : sourceData
  const filteredData = useMemo(() => {
    if (!searchTerm) return displayData
    const term = searchTerm.toLowerCase()
    return displayData.filter((e: any) =>
      (e.fullname ?? e.name ?? '').toLowerCase().includes(term)
    )
  }, [displayData, searchTerm])

  const maxScore = useMemo(() => {
    if (mainTab === 'groups' || filteredData.length === 0) return 0
    return Math.max(...(filteredData as Leaderboard[]).map((e) => Number(e[currentRd])))
  }, [filteredData, currentRd, mainTab])

  if (isLoading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Image src={cfccLogo} alt="CFCC" width={140} height={70} className="h-10 w-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 text-xs font-bold ${
                  connected
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}
              >
                <span
                  className={`w-2 h-2 ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
                />
                {connected ? 'LIVE' : 'OFFLINE'}
              </span>
              <span className="text-xs text-slate-400 font-medium">Updates realtime</span>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Main Tabs - RECTANGULAR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-white border-2 border-slate-200 p-1 inline-flex">
            {[
              { id: 'overall', label: 'Overall', icon: Trophy },
              { id: 'rounds', label: 'Rounds', icon: BarChart3 },
              { id: 'groups', label: 'Groups', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as MainTab)}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm transition-all border-2 ${
                  mainTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Round Sub-tabs - RECTANGULAR */}
        <AnimatePresence mode="wait">
          {mainTab === 'rounds' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center mb-6"
            >
              <div className="flex gap-1 bg-white border-2 border-slate-200 p-1">
                {(Object.keys(ROUND_CONFIG) as RoundTab[]).map((r) => {
                  const config = ROUND_CONFIG[r]
                  const isActive = roundTab === r
                  return (
                    <button
                      key={r}
                      onClick={() => setRoundTab(r)}
                      className={`px-5 py-2 font-bold text-sm transition-all border-2 ${
                        isActive
                          ? `${config.color} ${config.borderColor} bg-slate-50`
                          : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Podium - Only for individual views */}
        {mainTab !== 'groups' && (
          <Podium data={filteredData as Leaderboard[]} rd={currentRd} />
        )}

        {/* Main Card - RECTANGULAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-2 border-slate-200 overflow-hidden shadow-sm"
        >
          {/* Card Header */}
          <div className="px-6 py-5 border-b-2 border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 flex items-center justify-center shadow-sm">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-black text-slate-800 text-lg">
                  {mainTab === 'groups'
                    ? 'Group Rankings'
                    : mainTab === 'overall'
                      ? 'Overall Rankings'
                      : ROUND_CONFIG[roundTab].label + ' Rankings'}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {filteredData.length} {filteredData.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>

            {/* Search - RECTANGULAR */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2.5 border-2 border-slate-300 text-sm font-semibold text-slate-700 w-full sm:w-56 outline-none focus:border-orange-500 transition-colors bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Table Header */}
          <div className={`grid ${mainTab === 'groups' ? 'grid-cols-[60px_1fr_140px] sm:grid-cols-[70px_1fr_200px]' : 'grid-cols-[60px_1fr_80px_140px] sm:grid-cols-[70px_1fr_100px_200px]'} px-4 sm:px-6 py-3 bg-slate-100 border-b-2 border-slate-200`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</span>
            <span className="px-3 sm:px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {mainTab === 'groups' ? 'Group' : 'Player'}
            </span>
            {mainTab !== 'groups' && (
              <span className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Group
              </span>
            )}
            <span className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
              Score
            </span>
          </div>

          {/* Table Body */}
          <div className="max-h-[500px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredData.length > 0 ? (
                filteredData.map((entry: any, i) => {
                  const rank = i + 1
                  return mainTab === 'groups' ? (
                    <GroupRow key={entry.name} entry={entry} rank={rank} />
                  ) : (
                    <LeaderboardRow
                      key={entry.userId}
                      entry={entry}
                      rank={rank}
                      rd={currentRd}
                      maxScore={maxScore}
                    />
                  )
                })
              ) : (
                <EmptyState searchTerm={searchTerm} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-orange-500" />
            <span className="font-medium">Real-time updates</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={14} />
            <span className="font-medium">Auto-refresh every 30s</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span className="font-medium">
              {leaderboardTotal.length} total contestants
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
