import { fetchUsers, fetchGrades, fetchQuizRoundMap } from "../repositories/mysql/leaderboard.repository";
import { transformLeaderboard } from "../transform/leaderboard.transform";
import { upsertLeaderboard } from "../repositories/sqlite/leaderboard.repository";

export async function syncLeaderboard() {
  console.log('[sync] leaderboard starting...')
  const roundMap = await fetchQuizRoundMap()
  const [users, grades] = await Promise.all([
    fetchUsers(),
    fetchGrades(roundMap),
  ])
  const transformed = transformLeaderboard(users, grades, roundMap)
  await upsertLeaderboard(transformed, 'mysql')
  console.log(`[sync] done — ${transformed.length} contestants`)
}