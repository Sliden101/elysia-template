import { Elysia, t } from 'elysia'
import dotenv from 'dotenv'

// Load root .env for Bun dev when not already provided by the environment
dotenv.config({ path: '../../../.env' })
import { openapi, fromTypes } from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'

import { otel } from '@api/modules'
/*import { leaderboardRoute } from './routes/leaderboard.route'*/ // rest route import
import { syncAll } from './db/sync'
import { getLeaderboardByRound, getOverallLeaderboard } from './db/repositories/sqlite/leaderboard.repository'
import { upsertLeaderboard } from './db/repositories/sqlite/leaderboard.repository'
import { isAdminRequest } from './admin/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clients = new Set<any>()

await syncAll()

setInterval(async()=>{
  console.log('[cron] syncing')
  await syncAll()
    
  const rd1 = await getLeaderboardByRound('rd1')
  const rd2 = await getLeaderboardByRound('rd2')
  const rd3 = await getLeaderboardByRound('rd3')
  const total = await getOverallLeaderboard()


  for (const client of clients) {
    client.send(JSON.stringify({ type: 'leaderboard_rd1', data: rd1 }))
    client.send(JSON.stringify({ type: 'leaderboard_rd2', data: rd2 }))
    client.send(JSON.stringify({ type: 'leaderboard_rd3', data: rd3 }))
    client.send(JSON.stringify({ type: 'leaderboard_total', data: total }))

  }

},3_000)



export const app = new Elysia()
  .use(
    openapi({
      references: fromTypes(
        process.env.NODE_ENV === 'production'
          ? 'dist/src/index.d.ts'
          : 'src/index.ts'
      )
    })
  )
  .use(otel)
  .use(
    cors({
      origin: 'http://localhost:3000'
    }))
  .ws('/ws', {
    
    async open(ws) {
      clients.add(ws)
      
         const rd1 = await getLeaderboardByRound('rd1')
         const rd2 = await getLeaderboardByRound('rd2')
         const rd3 = await getLeaderboardByRound('rd3')
         const total = await getOverallLeaderboard();


       ws.send(JSON.stringify({ type: 'leaderboard_rd1', data: rd1 }))
       ws.send(JSON.stringify({ type: 'leaderboard_rd2', data: rd2 }))
       ws.send(JSON.stringify({ type: 'leaderboard_rd3', data: rd3 }))
       ws.send(JSON.stringify({ type: 'leaderboard_total', data: total }))

    },
    close(ws) {
      clients.delete(ws)
    }
  })
  .get('/', () => 'Hello Elysia')
  .post('/admin/leaderboard', async (ctx) => {
    const req = (ctx as any).request as Request
    if (!isAdminRequest(req)) return new Response('unauthorized', { status: 401 })

    let rows: unknown
    try {
      rows = await req.json()
    } catch (e) {
      return new Response('invalid json', { status: 400 })
    }

    if (!Array.isArray(rows)) return new Response('expected array of rows', { status: 400 })

    // upsert into sqlite
    await upsertLeaderboard(rows as any)

    // broadcast updated leaderboards to WS client
    const rd1 = await getLeaderboardByRound('rd1')
    const rd2 = await getLeaderboardByRound('rd2')
    const rd3 = await getLeaderboardByRound('rd3')
    const total = await getOverallLeaderboard()

    for (const client of clients) {
      client.send(JSON.stringify({ type: 'leaderboard_rd1', data: rd1 }))
      client.send(JSON.stringify({ type: 'leaderboard_rd2', data: rd2 }))
      client.send(JSON.stringify({ type: 'leaderboard_rd3', data: rd3 }))
      client.send(JSON.stringify({ type: 'leaderboard_total', data: total }))
    }

    return { success: true }
  })
  .post('/admin/verify', async (ctx) => {
    const req = (ctx as any).request as Request
    if (!isAdminRequest(req)) return new Response('unauthorized', { status: 401 })
    return { ok: true }
  })
  .listen(Bun.env.PORT ?? 3001)

process.on('beforeExit', app.stop)

export type app = typeof app

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
