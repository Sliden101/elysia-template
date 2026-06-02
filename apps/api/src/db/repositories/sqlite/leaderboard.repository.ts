import { sqlite } from '../../engine'
import { NewLeaderboard, Leaderboard } from '../../schema/schema'

export function upsertLeaderboard(rows: NewLeaderboard[]) {
  const stmt = sqlite.prepare(`
    INSERT INTO leaderboard (userId, fullname, rd1, rd2, rd3, total)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (userId) DO UPDATE SET
      fullname = excluded.fullname,
      rd1      = excluded.rd1,
      rd2      = excluded.rd2,
      rd3      = excluded.rd3,
      total    = excluded.total
  `)

   const upsertAll = sqlite.transaction((rows: NewLeaderboard[]) => {
    for (const row of rows) {
      stmt.run(...[
        row.userId,
       row.fullname,
       row.rd1 ?? 0,
       row.rd2 ?? 0,
       row.rd3 ?? 0,
      row.total ?? 0,
] as [number, string, number, number, number, number])
    }
  })
  upsertAll(rows)

}

// each round only returns relevant columns + sorted by that round


export function getLeaderboardByRound(round: 'rd1' | 'rd2' | 'rd3'): Leaderboard[] {
  return sqlite.prepare(`
    SELECT userId, fullname, ${round}
    FROM leaderboard
    ORDER BY ${round} DESC
  `).all() as Leaderboard[]
}


export function getOverallLeaderboard(): Leaderboard[] {
  return sqlite.prepare(`
    SELECT userId, fullname, total
    FROM leaderboard
    ORDER BY total DESC
  `).all() as Leaderboard[]
}