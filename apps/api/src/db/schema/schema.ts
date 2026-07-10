import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const leaderboard = sqliteTable('leaderboard', {
  userId:    text('userId').primaryKey(),
  fullname:  text('fullname').notNull(),
  idnumber:  text('idnumber').notNull().default(''),
  group:     text('group').notNull().default(''),
  rd1:       integer('rd1').notNull().default(0),
  rd2:       integer('rd2').notNull().default(0),
  rd3:       integer('rd3').notNull().default(0),
  physical:  integer('physical').notNull().default(0),
  total:     integer('total').notNull().default(0),
  source:    text('source', { enum: ['mysql', 'manual'] }).notNull().default('mysql'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export type Leaderboard    = typeof leaderboard.$inferSelect
export type NewLeaderboard = typeof leaderboard.$inferInsert