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

  // 1. Insérer les utilisateurs avec leurs rôles directement
  await client.query(`
    INSERT INTO "user" (email, name, email_verified, image, visibility, role)
    VALUES
      -- Cas spéciaux Mike Codeur
      ('admin@mikecodeur.com', 'Mike Codeur', true, 'https://www.gravatar.com/avatar/ed8d664fa6324576c806b9ee59c302c6', 'private', 'admin'),
      ('ons@mikecodeur.com', 'Ons', true, 'https://randomuser.me/api/portraits/med/women/8.jpg', 'public', 'admin'),
      
      -- Rôles globaux purs (sans organisations)
      ('superadmin@gmail.com', 'Frank', true, 'https://randomuser.me/api/portraits/med/men/9.jpg', 'public', 'super_admin'),
      ('admin@gmail.com', 'Admin', false, 'https://randomuser.me/api/portraits/med/men/4.jpg', 'public', 'admin'),
      ('moderator@gmail.com', 'David', true, 'https://randomuser.me/api/portraits/med/men/7.jpg', 'public', 'moderator'),
      ('redactor@gmail.com', 'Grace', true, 'https://randomuser.me/api/portraits/med/women/11.jpg', 'public', 'redactor'),
      ('public@gmail.com', 'Charlie', true, 'https://randomuser.me/api/portraits/med/men/5.jpg', 'public', 'public'),
      
      -- Utilisateur multi-organisations (cas complexe)
      ('user@gmail.com', 'Bob', true, 'https://randomuser.me/api/portraits/med/men/3.jpg', 'public', 'user'),
      
      -- Utilisateurs spécialisés par rôle organisationnel
      ('user-owner@gmail.com', 'Julien', true, 'https://randomuser.me/api/portraits/med/men/6.jpg', 'public', 'user'),
      ('user-admin@gmail.com', 'Sophie', true, 'https://randomuser.me/api/portraits/med/women/12.jpg', 'public', 'user'),
      ('user-member@gmail.com', 'Lucas', true, 'https://randomuser.me/api/portraits/med/men/13.jpg', 'public', 'user'),
      
      -- Cas de chevauchement intéressants
      ('admin-owner@gmail.com', 'Emma', true, 'https://randomuser.me/api/portraits/med/women/14.jpg', 'public', 'admin'),
      ('moderator-member@gmail.com', 'Julie', true, 'https://randomuser.me/api/portraits/med/women/10.jpg', 'public', 'moderator'),
      
      -- Utilisateur isolé (sans organisations)
      ('user-isolated@gmail.com', 'Thomas', true, 'https://randomuser.me/api/portraits/med/men/15.jpg', 'public', 'user')
    ON CONFLICT (email) DO NOTHING;
  `)

  // 2. Insérer les comptes avec mots de passe
  await client.query(`
    INSERT INTO "account" (
      "account_id",
      "provider_id",
      "user_id",
      "password",
      "created_at",
      "updated_at"
    )
    SELECT 
      uuid_generate_v4() as "account_id",
      'credential' as "provider_id",
      u.id as "user_id",
      '48ea88853800794bc5312d8ad65fe149:d8503b790be4373e803d663b895438fa1e8f0b809a1b86a2b3fb6290f7f2310c4acb82dfe3737d2a3dd318a786653af3438022f24286ee0e9e8b2dda9b91f8f9' as "password",
      NOW() as "created_at",
      NOW() as "updated_at"
    FROM "user" u
    WHERE u.email IN (
      'admin@mikecodeur.com',
      'ons@mikecodeur.com',
      'superadmin@gmail.com',
      'admin@gmail.com',
      'moderator@gmail.com',
      'redactor@gmail.com',
      'public@gmail.com',
      'user@gmail.com',
      'user-owner@gmail.com',
      'user-admin@gmail.com',
      'user-member@gmail.com',
      'admin-owner@gmail.com',
      'moderator-member@gmail.com',
      'user-isolated@gmail.com'
    )
    ON CONFLICT ("account_id", "provider_id") DO NOTHING;
  `)

  // 3. Insérer les organisations
  await client.query(`
    INSERT INTO "organization" (name, slug, description, logo, created_at, updated_at)
    VALUES
      ('TechCorp Solutions', 'techcorp-solutions', 'Une entreprise de développement logiciel innovante', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', NOW(), NOW()),
      ('Marketing Pro', 'marketing-pro', 'Agence de marketing digital et communication', 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400', NOW(), NOW()),
      ('Acme Corp.', 'acme-corp', 'Startup innovante en technologie', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', NOW(), NOW()),
      ('Evil Corp.', 'evil-corp', 'Entreprise de cybersécurité', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', NOW(), NOW())
    ON CONFLICT (slug) DO NOTHING;
  `)

  // 4. Assigner les utilisateurs aux organisations avec des rôles
  await client.query(`
    INSERT INTO "member" (organization_id, user_id, role, created_at)
    SELECT 
      o.id as "organization_id",
      u.id as "user_id",
      CASE 
        -- Cas spéciaux Mike Codeur
        WHEN u.email = 'admin@mikecodeur.com' AND o.slug = 'techcorp-solutions' THEN 'owner'
        WHEN u.email = 'ons@mikecodeur.com' AND o.slug = 'techcorp-solutions' THEN 'admin'
        
        -- admin@gmail.com dans 3 organisations avec rôles différents
        WHEN u.email = 'admin@gmail.com' AND o.slug = 'techcorp-solutions' THEN 'member'
        WHEN u.email = 'admin@gmail.com' AND o.slug = 'marketing-pro' THEN 'admin'
        WHEN u.email = 'admin@gmail.com' AND o.slug = 'acme-corp' THEN 'owner'
        
        -- user@gmail.com : Cas multi-organisations complexe
        -- MEMBER dans TechCorp, ADMIN dans Acme Corp, OWNER dans Evil Corp
        WHEN u.email = 'user@gmail.com' AND o.slug = 'techcorp-solutions' THEN 'member'
        WHEN u.email = 'user@gmail.com' AND o.slug = 'acme-corp' THEN 'admin'
        WHEN u.email = 'user@gmail.com' AND o.slug = 'evil-corp' THEN 'owner'
        
        -- Utilisateurs spécialisés par rôle organisationnel
        WHEN u.email = 'user-owner@gmail.com' AND o.slug = 'techcorp-solutions' THEN 'owner'
        WHEN u.email = 'user-admin@gmail.com' AND o.slug = 'marketing-pro' THEN 'admin'
        WHEN u.email = 'user-member@gmail.com' AND o.slug = 'acme-corp' THEN 'member'
        
        -- Cas de chevauchement (rôle global élevé + rôle org)
        WHEN u.email = 'admin-owner@gmail.com' AND o.slug = 'marketing-pro' THEN 'owner'
        WHEN u.email = 'moderator-member@gmail.com' AND o.slug = 'techcorp-solutions' THEN 'member'
        
        ELSE 'member'
      END::organization_role,
      NOW()
    FROM "user" u, "organization" o
    WHERE 
      -- Cas spéciaux Mike Codeur
      (u.email = 'admin@mikecodeur.com' AND o.slug = 'techcorp-solutions') OR
      (u.email = 'ons@mikecodeur.com' AND o.slug = 'techcorp-solutions') OR
      
      -- admin@gmail.com dans 3 organisations
      (u.email = 'admin@gmail.com' AND o.slug = 'techcorp-solutions') OR
      (u.email = 'admin@gmail.com' AND o.slug = 'marketing-pro') OR
      (u.email = 'admin@gmail.com' AND o.slug = 'acme-corp') OR
      
      -- user@gmail.com dans 3 organisations avec rôles différents
      (u.email = 'user@gmail.com' AND o.slug = 'techcorp-solutions') OR
      (u.email = 'user@gmail.com' AND o.slug = 'acme-corp') OR
      (u.email = 'user@gmail.com' AND o.slug = 'evil-corp') OR
      
      -- Utilisateurs spécialisés (1 org chacun)
      (u.email = 'user-owner@gmail.com' AND o.slug = 'techcorp-solutions') OR
      (u.email = 'user-admin@gmail.com' AND o.slug = 'marketing-pro') OR
      (u.email = 'user-member@gmail.com' AND o.slug = 'acme-corp') OR
      
      -- Cas de chevauchement
      (u.email = 'admin-owner@gmail.com' AND o.slug = 'marketing-pro') OR
      (u.email = 'moderator-member@gmail.com' AND o.slug = 'techcorp-solutions')
      
      -- Note: user-isolated@gmail.com n'est dans aucune organisation (test isolation)
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  `)

  // 5. Insérer des projets pour tester les permissions
  await client.query(`
    INSERT INTO "project" (name, description, "organization_id", "created_by")
    SELECT 
      project_data.name,
      project_data.description,
      o.id as "organization_id",
      u.id as "created_by"
    FROM (
      VALUES 
        -- 1 projet pour TechCorp Solutions
        ('Plateforme E-commerce', 'Développement d''une plateforme de vente en ligne moderne avec Next.js', 'techcorp-solutions', 'admin@mikecodeur.com'),
        
        -- 2 projets pour Marketing Pro
        ('Campagne Digitale 2024', 'Stratégie marketing complète pour les réseaux sociaux', 'marketing-pro', 'user-admin@gmail.com'),
        ('Site Web Corporate', 'Refonte complète du site vitrine de l''entreprise', 'marketing-pro', 'admin-owner@gmail.com'),
        
        -- 0 projet pour Acme Corp (comme demandé - vide)
        
        -- 1 projet pour Evil Corp
        ('Audit Sécurité', 'Audit complet de la sécurité informatique', 'evil-corp', 'user@gmail.com')
    ) AS project_data(name, description, org_slug, creator_email)
    JOIN "organization" o ON o.slug = project_data.org_slug
    JOIN "user" u ON u.email = project_data.creator_email
    ON CONFLICT DO NOTHING;
  `)

  // 6. Insérer des tâches pour tester différents états de projets
  await client.query(`
    INSERT INTO "task" (title, description, status, "due_date", "project_id", "organization_id", "created_by")
    SELECT 
      task_data.title,
      task_data.description,
      task_data.status::task_status,
      task_data.due_date::timestamp,
      p.id as "project_id",
      p."organization_id",
      u.id as "created_by"
    FROM (
      VALUES 
        -- 2 tâches pour TechCorp - Plateforme E-commerce
        ('Configuration Next.js', 'Mise en place de l''architecture Next.js avec TypeScript', 'done', '2024-09-15', 'Plateforme E-commerce', 'admin@mikecodeur.com'),
        ('Intégration Stripe', 'Implémentation du système de paiement avec Stripe', 'in_progress', '2024-12-01', 'Plateforme E-commerce', 'ons@mikecodeur.com'),
        
        -- 1 tâche pour Marketing Pro - Campagne Digitale
        ('Création des visuels', 'Design des bannières pour les réseaux sociaux', 'todo', '2024-11-15', 'Campagne Digitale 2024', 'user-admin@gmail.com'),
        
        -- 0 tâche pour Marketing Pro - Site Web Corporate (pas de VALUES pour ce projet)
        
        -- 1 tâche pour Evil Corp - Audit Sécurité  
        ('Scan des vulnérabilités', 'Analyse complète des failles de sécurité', 'in_progress', '2024-10-30', 'Audit Sécurité', 'user@gmail.com')
    ) AS task_data(title, description, status, due_date, project_name, creator_email)
    JOIN "project" p ON p.name = task_data.project_name
    JOIN "user" u ON u.email = task_data.creator_email
    ON CONFLICT DO NOTHING;
  `)

  const end = Date.now()

  console.log('✅ Seed inserted in', end - start, 'ms')
  console.log('')
  console.log('📊 Jeu de test créé avec succès :')
  console.log(
    '🔹 Rôles globaux purs : superadmin, admin, moderator, redactor, public'
  )
  console.log('🔹 Utilisateur multi-org : user@gmail.com (MEMBER→ADMIN→OWNER)')
  console.log(
    '🔹 Utilisateurs spécialisés : user-owner, user-admin, user-member'
  )
  console.log('🔹 Cas de chevauchement : admin-owner, moderator-member')
  console.log('🔹 Utilisateur isolé : user-isolated (aucune organisation)')
  console.log('')
  console.log('📝 Projets et tâches créés par organisation :')
  console.log('🔹 TechCorp Solutions : 1 projet (2 tâches)')
  console.log('  └─ Plateforme E-commerce: Configuration ✅ + Intégration 🔄')
  console.log('🔹 Marketing Pro : 2 projets (1 tâche total)')
  console.log('  ├─ Campagne Digitale: Création visuels 📋')
  console.log('  └─ Site Web Corporate: 0 tâche (vide)')
  console.log('🔹 Acme Corp : 0 projet (vide pour tests)')
  console.log('🔹 Evil Corp : 1 projet (1 tâche)')
  console.log('  └─ Audit Sécurité: Scan vulnérabilités 🔄')
  console.log('')
  console.log('📊 Statuts des tâches : ✅ Done | 🔄 In Progress | 📋 Todo')
  console.log('')

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
