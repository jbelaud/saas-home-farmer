#!/usr/bin/env node
/* eslint-disable no-restricted-properties */

/**
 * Script de correction : marque la migration 0000 comme déjà appliquée
 * dans la table __drizzle_migrations, sans rejouer le SQL.
 *
 * À utiliser quand le schéma existe déjà en base mais que la table
 * de suivi Drizzle est vide (ex: migration manuelle ou import SQL direct).
 */

import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/node-postgres'
import pg from 'pg'

import initDotEnv from './env'

initDotEnv()

const fixMigrationHistory = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  })

  await client.connect()
  const db = drizzle(client)

  console.log('🔍 Vérification de la table __drizzle_migrations...')

  // Crée la table de suivi si elle n'existe pas encore
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `)

  // Vérifie si la migration 0000 est déjà enregistrée
  const existing = await db.execute(sql`
    SELECT id FROM "__drizzle_migrations" LIMIT 1
  `)

  if (existing.rows.length > 0) {
    console.log(
      '✅ La table __drizzle_migrations contient déjà des entrées. Rien à faire.'
    )
    await client.end()
    process.exit(0)
  }

  console.log("⚙️  Insertion de la migration 0000 dans l'historique Drizzle...")

  // Hash SHA256 du fichier 0000_minor_kylun.sql (calculé par drizzle-kit generate)
  // On insère avec le timestamp de création du journal
  await db.execute(sql`
    INSERT INTO "__drizzle_migrations" (hash, created_at)
    VALUES ('0000_minor_kylun', 1769570066501)
  `)

  console.log('✅ Migration 0000 marquée comme appliquée.')
  console.log('👉 Tu peux maintenant relancer : pnpm db:migrate')

  await client.end()
  process.exit(0)
}

try {
  await fixMigrationHistory()
} catch (error) {
  console.error('❌ Erreur lors du fix de migration')
  console.error(error)
  process.exit(1)
}
