# Memory

## Project Overview
Static leaderboard for CFCC competition. Next.js (apps/web) with serverless API routes. Data exported from root sqlite.db to JSON at build time.

## Architecture
- **apps/web**: Next.js app with API routes under `src/app/api/leaderboard`
- **data/**: Pre-exported JSON files (rd1.json, rd2.json, rd3.json, physical.json, total.json)
- **scripts/export-leaderboard.ts**: Reads root sqlite.db, writes JSON to apps/web/data/
- No Elysia API, no WebSocket, no MySQL sync, no Bun server

## Key Commands
- `bun apps/web/run data:export` — refresh JSON from sqlite.db
- `bun apps/web/run build` — export + next build
- `bun apps/web/run dev` — local dev server

## Data Flow
sqlite.db (root) → export-leaderboard.ts → apps/web/data/*.json → API route → HTTP fetch → frontend

## Deployment
Vercel (apps/web as framework). Must run data:export before build if sqlite.db changes.

## Files to Delete on Cleanup
- apps/web/src/hooks/useWebSocket.ts (deleted)
- apps/web/src/components/LeaderboardHeader.tsx (deleted)
- apps/web/src/components/LeaderboardTable.tsx (deleted)
