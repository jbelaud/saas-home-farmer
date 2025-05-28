import {drizzle} from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'

import * as user from './user-model'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limite de connexions
  idleTimeoutMillis: 30_000, // Timeout pour connexions inactives
  connectionTimeoutMillis: 10_000,
})

const db = drizzle(pool, {
  schema: {
    ...user,
  },
})

if (process.env.NODE_ENV === 'test') {
  throw new Error('Database connections are not allowed during tests.')
}

export default db
