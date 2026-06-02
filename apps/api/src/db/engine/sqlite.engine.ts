import {Database} from 'bun:sqlite'


export const sqlite = new Database(Bun.env.DATABASE_URL ?? 'sqlite.db')


