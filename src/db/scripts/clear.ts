#!/usr/bin/env node
import {drizzle} from 'drizzle-orm/node-postgres'
import pg from 'pg'
import {sql} from 'drizzle-orm'
import initDotEnv from './env'

initDotEnv()

const runClean = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  })

  await client.connect()
  const db = drizzle(client)

  console.log('⏳ Running cleanning...')

  const start = Date.now()

  // Drop tables
  await db.execute(sql`
    DO $$ 
    DECLARE 
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `)

  // Drops enums
  await db.execute(sql`
    DO $$ 
    DECLARE 
      r RECORD;
    BEGIN
      FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
    END $$;
  `)
  const end = Date.now()

  console.log('✅ Clean completed in', end - start, 'ms')

  process.exit(0)
}

try {
  await runClean()
} catch (error) {
  console.error('❌ Clean failed')
  console.error(error)
  process.exit(1)
}
