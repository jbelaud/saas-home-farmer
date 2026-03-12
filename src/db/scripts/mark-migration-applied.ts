#!/usr/bin/env node
/* eslint-disable no-restricted-properties */
import {createHash} from 'crypto'
import {readFileSync} from 'fs'
import pg from 'pg'

import initDotEnv from './env'

initDotEnv()

const run = async () => {
  const client = new pg.Client({connectionString: process.env.DATABASE_URL})
  await client.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `)

  const existing = await client.query(
    `SELECT id FROM "__drizzle_migrations" LIMIT 1`
  )

  if (existing.rows.length > 0) {
    console.log('✅ Déjà des entrées dans __drizzle_migrations — rien à faire.')
    await client.end()
    return
  }

  const content = readFileSync(
    './drizzle/migrations/0000_minor_kylun.sql',
    'utf8'
  )
  const hash = createHash('sha256').update(content).digest('hex')

  await client.query(
    `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
    [hash, 1769570066501]
  )

  console.log(`✅ Migration 0000 marquée comme appliquée (hash: ${hash})`)
  console.log('👉 Lance maintenant : pnpm db:migrate')
  await client.end()
}

run().catch((e) => {
  console.error('❌', e.message)
  process.exit(1)
})
