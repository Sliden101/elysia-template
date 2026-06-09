'use client'
import { Leaderboard } from "@api/db/schema/schema"
import { SearchBar } from "./searchBar"
import { useState } from "react"


interface LeaderboardTableProps {
  data: Leaderboard[]
  rd: 'rd1' | 'rd2' | 'rd3' | 'total'
}

const medals = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ data, rd }: LeaderboardTableProps) {
  const topScore = data.reduce((max, d) => Math.max(max, Number(d[rd])), 0)

  return(
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                   Score
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => {
                const score = Number(entry[rd])
                const barWidth = topScore > 0 ? (score / topScore) * 100 : 0
                return (
                  <tr
                    key={entry.userId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                    style={{ animation: `fade-in-up 0.3s ease-out both`, animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      {index < 3 ? (
                        <span className="text-lg">{medals[index]}</span>
                      ) : (
                        <span className="text-slate-500 font-medium">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <h1 className="font-medium text-slate-800">{entry.fullname}</h1>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-3 py-1.5 rounded font-semibold">
                          <span
                            className="text-lg"
                            key={`${entry.userId}-${score}`}
                            style={{ animation: 'score-pop 0.3s ease-out' }}
                          >
                            {score}
                          </span>
                        </div>
                        {topScore > 0 && (
                          <div className="w-16 bg-slate-200 h-1 rounded">
                            <div
                              className="bg-orange-500 h-1 rounded"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        )}
                        {index > 0 && topScore > 0 && (
                          <span className="text-xs text-slate-400">-{topScore - score}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
          <span>Auto-refreshing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <span>Total Contestant: {data.length}</span>
        </div>
      </div>
    </div>
  )
}
