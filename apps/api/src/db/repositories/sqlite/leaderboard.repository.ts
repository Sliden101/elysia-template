import { sqliteDb } from '../../engine'
import { NewLeaderboard, Leaderboard, leaderboard } from '../../schema/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function upsertLeaderboard(rows: NewLeaderboard[]) {
  await sqliteDb.transaction(async (tx) => {
    for (const row of rows) {
      await tx
        .insert(leaderboard)
        .values({
          userId: row.userId,
          fullname: row.fullname,
          group: row.group ?? '',
          rd1: row.rd1 ?? 0,
          rd2: row.rd2 ?? 0,
          rd3: row.rd3 ?? 0,
          total: row.total ?? 0,
        })
        .onConflictDoUpdate({
          target: leaderboard.userId,
          set: {
            fullname: row.fullname,
            group: row.group ?? '',
            rd1: row.rd1 ?? 0,
            rd2: row.rd2 ?? 0,
            rd3: row.rd3 ?? 0,
            total: row.total ?? 0,
          },
      })
    }
  })
}

// each round only returns relevant columns + sorted by that round

export async function getLeaderboardByRound(round: 'rd1' | 'rd2' | 'rd3'): Promise<Leaderboard[]> {
  const results = await sqliteDb
    .select({
      userId: leaderboard.userId,
      fullname: leaderboard.fullname,
      group: leaderboard.group,
      [round]: leaderboard[round],
    })
    .from(leaderboard)
    .orderBy(desc(leaderboard[round]))

  return results as Leaderboard[]
}

export async function getOverallLeaderboard(): Promise<Leaderboard[]> {
  try {
    const results = await sqliteDb
    .select({
      userId: leaderboard.userId,
      fullname: leaderboard.fullname,
      group: leaderboard.group,
      total: leaderboard.total,
    })
    .from(leaderboard)
    .orderBy(desc(leaderboard.total))

  return results as Leaderboard[]

  } catch (error)  {
    console.error('Error fetching overall leaderboard:', error)
    return []
  }
}

export async function getGroupLeaderboard(round: 'rd1' | 'rd2' | 'rd3' | 'total'): Promise<{ group: string; score: number }[]> {
  const results = await sqliteDb
    .select({
      group: leaderboard.group,
      score: sql`SUM(${leaderboard[round]})`.mapWith(Number),
    })
    .from(leaderboard)
    .groupBy(leaderboard.group)
    .orderBy(desc(sql`SUM(${leaderboard[round]})`))

  return results
}