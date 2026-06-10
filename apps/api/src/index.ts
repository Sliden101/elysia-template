import { Elysia, t } from 'elysia'
import dotenv from 'dotenv'

// Load root .env for Bun dev when not already provided by the environment
dotenv.config({ path: '../../../.env' })
import { openapi, fromTypes } from '@elysiajs/openapi'
import { cors } from '@elysiajs/cors'

import { otel } from '@api/modules'
import { insertMessage, getMessages } from '@api/db'
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
    
  const rd1 = getLeaderboardByRound('rd1')
  const rd2 = getLeaderboardByRound('rd2')
  const rd3 = getLeaderboardByRound('rd3')
  const total=getOverallLeaderboard()


  for (const client of clients) {
    client.send(JSON.stringify({ type: 'leaderboard_rd1', data: rd1 }))
    client.send(JSON.stringify({ type: 'leaderboard_rd2', data: rd2 }))
    client.send(JSON.stringify({ type: 'leaderboard_rd3', data: rd3 }))
    client.send(JSON.stringify({ type: 'leaderboard_total', data: total }))

  }

},10_000)



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
 /* .use(leaderboardRoute) */ // not sure need rest route or not 
  .ws('/ws', {
    message(ws, message) {
      const content = String(message)
      insertMessage(content).then(([saved]) => {
        const broadcast = JSON.stringify({ type: 'message', data: saved })
        for (const client of clients) {
          client.send(broadcast)
        }
      })
    },
    open(ws) {
      clients.add(ws)
      getMessages(50).then((history) => {
        ws.send(JSON.stringify({ type: 'history', data: history }))
      })
         const rd1 = getLeaderboardByRound('rd1')
         const rd2 = getLeaderboardByRound('rd2')
         const rd3 = getLeaderboardByRound('rd3')
         const total=getOverallLeaderboard();

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
    upsertLeaderboard(rows as any)

    // broadcast updated leaderboards to WS clients
    const rd1 = getLeaderboardByRound('rd1')
    const rd2 = getLeaderboardByRound('rd2')
    const rd3 = getLeaderboardByRound('rd3')
    const total = getOverallLeaderboard()

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
