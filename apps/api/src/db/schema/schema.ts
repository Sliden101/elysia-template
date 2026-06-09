import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'



export const leaderboard = sqliteTable('leaderboard', {
  userId:   integer('userId').primaryKey(),
  fullname: text('fullname').notNull(),
  rd1:      integer('rd1').notNull().default(0),
  rd2:      integer('rd2').notNull().default(0),
  rd3:      integer('rd3').notNull().default(0),
  total:    integer('total').notNull().default(0),
})

export type Leaderboard    = typeof leaderboard.$inferSelect
export type NewLeaderboard = typeof leaderboard.$inferInsert


