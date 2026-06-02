import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const messages = sqliteTable('messages', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date())
})




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



export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert


