import { fetchUsers, fetchGrades } from "../repositories/mysql/leaderboard.repository";
import { transformLeaderboard } from "../transform/leaderboard.transform";
import { upsertLeaderboard } from "../repositories/sqlite/leaderboard.repository";

export async function syncLeaderboard() {
  console.log('[sync] leaderboard starting...')
  const [users, grades] = await Promise.all([
    fetchUsers(),
    fetchGrades(),
  ])
  const transformed = transformLeaderboard(users, grades)
  await upsertLeaderboard(transformed, 'mysql')   // <-- was missing 'mysql', and missing await
  console.log(`[sync] done — ${transformed.length} contestants`)
}