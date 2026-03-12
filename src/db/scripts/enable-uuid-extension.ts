import {Client} from 'pg'

import initDotEnv from './env'

initDotEnv()

async function enableUuidExtension() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('🔧 Connexion à la base de données...')
    await client.connect()

    console.log("🔧 Activation de l'extension uuid-ossp...")
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    console.log('✅ Extension uuid-ossp activée avec succès!')
  } catch (error) {
    console.error("❌ Erreur lors de l'activation de l'extension:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

enableUuidExtension()
