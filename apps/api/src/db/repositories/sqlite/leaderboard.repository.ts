import { sqliteDb } from '../../engine'
import { NewLeaderboard, Leaderboard, leaderboard } from '../../schema/schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function upsertLeaderboard(
  rows: NewLeaderboard[],
  source: 'mysql' | 'manual' = 'manual'
) {
  await sqliteDb.transaction(async (tx) => {
    let skipIds: number[] = []

    if (source === 'mysql') {
      // don't let the cron sync clobber rows an admin edited by hand
      const manualRows = await tx
        .select({ userId: leaderboard.userId })
        .from(leaderboard)
        .where(eq(leaderboard.source, 'manual'))
      skipIds = manualRows.map((r) => r.userId)
    }

    for (const row of rows) {
      if (source === 'mysql' && row.userId != null && skipIds.includes(row.userId)) continue

      await tx
        .insert(leaderboard)
        .values({
          userId: row.userId,
          fullname: row.fullname,
          group: row.group ?? '',
          rd1: row.rd1 ?? 0,
          rd2: row.rd2 ?? 0,
          rd3: row.rd3 ?? 0,
          physical: row.physical ?? 0,
          total: row.total ?? 0,
          source,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: leaderboard.userId,
          set: {
            fullname: row.fullname,
            group: row.group ?? '',
            rd1: row.rd1 ?? 0,
            rd2: row.rd2 ?? 0,
            rd3: row.rd3 ?? 0,
            physical: row.physical ?? 0,
            total: row.total ?? 0,
            source,
            updatedAt: new Date(),
          },
        })
    }
  })
}


// each round only returns relevant columns + sorted by that round

export async function getLeaderboardByRound(round: 'rd1' | 'rd2' | 'rd3' | 'physical'): Promise<Leaderboard[]> {
  const results = await sqliteDb
    .select({
      userId: leaderboard.userId,
      fullname: leaderboard.fullname,
      group: leaderboard.group,
      [round]: leaderboard[round],
    })
    .from(leaderboard)
    .orderBy(desc(leaderboard[round]))

  return results as unknown as Leaderboard[]
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

  return results as unknown as Leaderboard[]

  } catch (error)  {
    console.error('Error fetching overall leaderboard:', error)
    return []
  }
}

export async function getGroupLeaderboard(round: 'rd1' | 'rd2' | 'rd3' | 'physical' | 'total'): Promise<{ group: string; score: number }[]> {
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



export async function partialUpdateLeaderboard(
  rows: (Partial<NewLeaderboard> & { userId: number })[]
) {
  await sqliteDb.transaction(async (tx) => {
    for (const row of rows) {
      const existingRows = await tx
        .select()
        .from(leaderboard)
        .where(eq(leaderboard.userId, row.userId))

      const existing = existingRows[0]

      const merged = {
        fullname: row.fullname ?? existing?.fullname,
        group: row.group ?? existing?.group ?? '',
        rd1: row.rd1 ?? existing?.rd1 ?? 0,
        rd2: row.rd2 ?? existing?.rd2 ?? 0,
        rd3: row.rd3 ?? existing?.rd3 ?? 0,
        physical: row.physical ?? existing?.physical ?? 0,
      }

      if (!merged.fullname) {
        throw new Error(`Cannot create new leaderboard entry for userId ${row.userId} without a fullname`)
      }

      const total = merged.rd1 + merged.rd2 + merged.rd3 + merged.physical

      if (existing) {
        await tx
          .update(leaderboard)
          .set({ ...merged, total, source: 'manual', updatedAt: new Date() })
          .where(eq(leaderboard.userId, row.userId))
      } else {
        await tx.insert(leaderboard).values({
          userId: row.userId,
          ...merged,
          total,
          source: 'manual',
          updatedAt: new Date(),
        })
      }
    }
  })
}