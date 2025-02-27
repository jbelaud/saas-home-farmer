#!/usr/bin/env node

import pg from 'pg'
import initDotEnv from './env'

initDotEnv()

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Do not use in production')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  })

  console.log('⏳ Checking connexion ...')
  console.log(`🗄️  URL : ${process.env.DATABASE_URL}`)

  await client.connect()

  const start = Date.now()

  await client.query(` 
    
INSERT INTO "user" (email, name, "emailVerified", role, image, visibility)
VALUES
  ('admin@mikecodeur.com', 'Mike Codeur', '2024-09-05', 'admin', 'https://www.gravatar.com/avatar/ed8d664fa6324576c806b9ee59c302c6', 'private'),
  ('user@gmail.com', 'Bob', '2024-09-01', 'user', 'https://randomuser.me/api/portraits/med/men/3.jpg', 'public'),
  ('admin@gmail.com', 'Admin', NULL, 'admin', 'https://randomuser.me/api/portraits/med/men/4.jpg', 'public'),
  ('guest@gmail.com', 'Charlie', '2024-08-15', 'public', 'https://randomuser.me/api/portraits/med/men/5.jpg', 'public'),
  ('user@gmail.com', 'Julien', '2024-08-15', 'user', 'https://randomuser.me/api/portraits/med/men/6.jpg', 'public'),
  ('moderator@gmail.com', 'David', '2024-08-20', 'admin', 'https://randomuser.me/api/portraits/med/men/7.jpg', 'public'),
  ('ons@mikecodeur.com', 'Ons', '2024-09-03', 'admin', 'https://randomuser.me/api/portraits/med/women/8.jpg', 'public'),
  ('superadmin@gmail.com', 'Frank', '2024-09-04', 'admin', 'https://randomuser.me/api/portraits/med/men/9.jpg', 'public'),
  ('moderator-2@gmail.com', 'Julie', '2024-09-04', 'admin', 'https://randomuser.me/api/portraits/med/women/10.jpg', 'public'),
  ('redactor-2@gmail.com', 'Grace', '2024-09-02', 'user', 'https://randomuser.me/api/portraits/med/women/11.jpg', 'public');

     `)

  const end = Date.now()

  console.log('✅ Seed inserted in', end - start, 'ms')

  process.exit(0)
}

export default seed

try {
  await seed()
} catch (error) {
  console.error('❌ Connexion failed')
  console.error(error)
  process.exit(1)
}
