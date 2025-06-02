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

  // 1. Insérer les rôles de base
  await client.query(`
    INSERT INTO "role" (name, description)
    VALUES
      ('user', 'Utilisateur standard avec accès limité'),
      ('admin', 'Administrateur avec tous les privilèges'),
      ('public', 'Utilisateur public avec accès minimal')
    ON CONFLICT (name) DO NOTHING;
  `)

  // 2. Insérer les utilisateurs (sans le champ role qui n'existe plus)
  await client.query(`
    INSERT INTO "user" (email, name, "emailVerified", image, visibility)
    VALUES
      ('admin@mikecodeur.com', 'Mike Codeur', '2024-09-05', 'https://www.gravatar.com/avatar/ed8d664fa6324576c806b9ee59c302c6', 'private'),
      ('user@gmail.com', 'Bob', '2024-09-01', 'https://randomuser.me/api/portraits/med/men/3.jpg', 'public'),
      ('admin@gmail.com', 'Admin', NULL, 'https://randomuser.me/api/portraits/med/men/4.jpg', 'public'),
      ('guest@gmail.com', 'Charlie', '2024-08-15', 'https://randomuser.me/api/portraits/med/men/5.jpg', 'public'),
      ('julien@gmail.com', 'Julien', '2024-08-15', 'https://randomuser.me/api/portraits/med/men/6.jpg', 'public'),
      ('moderator@gmail.com', 'David', '2024-08-20', 'https://randomuser.me/api/portraits/med/men/7.jpg', 'public'),
      ('ons@mikecodeur.com', 'Ons', '2024-09-03', 'https://randomuser.me/api/portraits/med/women/8.jpg', 'public'),
      ('superadmin@gmail.com', 'Frank', '2024-09-04', 'https://randomuser.me/api/portraits/med/men/9.jpg', 'public'),
      ('moderator-2@gmail.com', 'Julie', '2024-09-04', 'https://randomuser.me/api/portraits/med/women/10.jpg', 'public'),
      ('redactor-2@gmail.com', 'Grace', '2024-09-02', 'https://randomuser.me/api/portraits/med/women/11.jpg', 'public')
    ON CONFLICT (email) DO NOTHING;
  `)

  // 3. Assigner les rôles aux utilisateurs via la table de liaison
  await client.query(`
    INSERT INTO "user_role" ("userId", "roleId")
    SELECT 
      u.id as "userId",
      r.id as "roleId"
    FROM "user" u, "role" r
    WHERE 
      (u.email = 'admin@mikecodeur.com' AND r.name = 'admin') OR
      (u.email = 'user@gmail.com' AND r.name = 'user') OR
      (u.email = 'admin@gmail.com' AND r.name = 'admin') OR
      (u.email = 'guest@gmail.com' AND r.name = 'public') OR
      (u.email = 'julien@gmail.com' AND r.name = 'user') OR
      (u.email = 'moderator@gmail.com' AND r.name = 'admin') OR
      (u.email = 'moderator@gmail.com' AND r.name = 'user') OR
      (u.email = 'ons@mikecodeur.com' AND r.name = 'admin') OR
      (u.email = 'superadmin@gmail.com' AND r.name = 'admin') OR
      (u.email = 'superadmin@gmail.com' AND r.name = 'user') OR
      (u.email = 'moderator-2@gmail.com' AND r.name = 'admin') OR
      (u.email = 'moderator-2@gmail.com' AND r.name = 'user') OR
      (u.email = 'redactor-2@gmail.com' AND r.name = 'user')
    ON CONFLICT ("userId", "roleId") DO NOTHING;
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
