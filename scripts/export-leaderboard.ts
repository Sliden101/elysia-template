#!/usr/bin/env bun
import { Database } from 'bun:sqlite'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'

const DB_PATH = path.join(import.meta.dir, '..', 'sqlite.db')
const DATA_DIR = path.join(import.meta.dir, '..', 'apps', 'web', 'data')

mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(DB_PATH)

const rounds = ['rd1', 'rd2', 'rd3', 'physical', 'total'] as const

for (const round of rounds) {
  let rows: unknown[]

  if (round === 'total') {
    rows = db
      .query(
        'SELECT userId, fullname, "group", total FROM leaderboard ORDER BY total DESC'
      )
      .all()
  } else {
    rows = db
      .query(
        `SELECT userId, fullname, "group", ${round} FROM leaderboard ORDER BY ${round} DESC`
      )
      .all()
  }

  writeFileSync(path.join(DATA_DIR, `${round}.json`), JSON.stringify(rows), 'utf-8')
  console.log(`  ${round}.json — ${rows.length} rows`)
}

db.close()
console.log('Done exporting leaderboard data.')
