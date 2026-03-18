#!/usr/bin/env node
/* eslint-disable no-restricted-properties */

import pg from 'pg'

import initDotEnv from './env'

initDotEnv()

// ============================================================
// SEED MyHomeFarmer — Données réalistes
// 1 SuperAdmin, 1 Farmer (Jean Dupont), 12 clients jardin
// Interventions passées + futures, récoltes
// ============================================================

// Stripe Price IDs constants (MHF plans)
const STRIPE_PRICE_IDS = {
  GRAINE: 'free',
  POUSSE_MONTHLY: 'price_mhf_pousse_monthly',
  RECOLTE_FR_MONTHLY: 'price_mhf_recolte_fr_monthly',
  RECOLTE_EU_MONTHLY: 'price_mhf_recolte_eu_monthly',
} as const

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

  console.log('⏳ Connexion à la base de données...')
  console.log(`🗄️  URL : ${process.env.DATABASE_URL}`)

  await client.connect()

  const start = Date.now()

  // ============================================================
  // 0. Plans d'abonnement MyHomeFarmer
  // ============================================================
  await client.query(`
    INSERT INTO "subscription_plan" (
      "code", "price_id", "annual_discount_price_id", "plan_name", "description",
      "limits", "free_trial", "features", "price", "yearly_price",
      "currency", "is_recurring", "status", "display_order", "created_at", "updated_at"
    ) VALUES
      ('graine', '${STRIPE_PRICE_IDS.GRAINE}', NULL, 'Graine', 'Testez gratuitement avec 1 client',
       '{"clients": 1, "storage": 1}', NULL,
       '["1 client", "Rapport d''intervention", "Photos jardin", "Support communautaire"]',
       0, 0, 'EUR', true, 'active', 1, NOW(), NOW()),

      ('pousse', '${STRIPE_PRICE_IDS.POUSSE_MONTHLY}', NULL, 'Pousse', 'Jusqu''à 20 clients',
       '{"clients": 20, "storage": 5}', NULL,
       '["Jusqu''à 20 clients", "Rapports illimités", "Photos jardin", "Agenda & tournées", "Support prioritaire"]',
       9, 49, 'EUR', true, 'active', 2, NOW(), NOW()),

      ('recolte_fr', '${STRIPE_PRICE_IDS.RECOLTE_FR_MONTHLY}', NULL, 'Récolte (France)', 'Clients illimités + API Fiscale SAP',
       '{"clients": -1, "storage": 20}', NULL,
       '["Clients illimités", "Module SAP (crédit d''impôt 50%)", "Attestations fiscales PDF", "API Fiscale", "Support 24/7"]',
       39, 99, 'EUR', true, 'active', 3, NOW(), NOW()),

      ('recolte_eu', '${STRIPE_PRICE_IDS.RECOLTE_EU_MONTHLY}', NULL, 'Récolte (BE/CH)', 'Clients illimités',
       '{"clients": -1, "storage": 20}', NULL,
       '["Clients illimités", "Rapports illimités", "Photos jardin", "Agenda & tournées", "Support 24/7"]',
       29, 69, 'EUR', true, 'active', 4, NOW(), NOW())
    ON CONFLICT (code) DO NOTHING;
  `)

  // ============================================================
  // 1. Utilisateurs : SuperAdmin + Farmer Jean
  // ============================================================
  await client.query(`
    INSERT INTO "user" (email, name, email_verified, image, visibility, role)
    VALUES
      ('superadmin@myhomefarmer.com', 'SuperAdmin MHF', true, NULL, 'public', 'super_admin'),
      ('jean@homefarmer.com', 'Jean Dupont', true, 'https://randomuser.me/api/portraits/med/men/32.jpg', 'public', 'user')
    ON CONFLICT (email) DO NOTHING;
  `)

  // ============================================================
  // 2. Comptes avec mot de passe (password = "password")
  // ============================================================
  await client.query(`
    INSERT INTO "account" ("account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
    SELECT
      uuid_generate_v4(),
      'credential',
      u.id,
      '48ea88853800794bc5312d8ad65fe149:d8503b790be4373e803d663b895438fa1e8f0b809a1b86a2b3fb6290f7f2310c4acb82dfe3737d2a3dd318a786653af3438022f24286ee0e9e8b2dda9b91f8f9',
      NOW(), NOW()
    FROM "user" u
    WHERE u.email IN ('superadmin@myhomefarmer.com', 'jean@homefarmer.com')
    ON CONFLICT ("account_id", "provider_id") DO NOTHING;
  `)

  // ============================================================
  // 3. Organisation du Farmer (= son entreprise)
  // ============================================================
  await client.query(`
    INSERT INTO "organization" (name, slug, description, logo, created_at, updated_at)
    VALUES ('Jean Dupont Jardinage', 'jean-dupont-jardinage', 'Entrepreneur jardinier Home Farmer — Île-de-France', NULL, NOW(), NOW())
    ON CONFLICT (slug) DO NOTHING;
  `)

  // ============================================================
  // 4. Membre : Jean = owner de son org
  // ============================================================
  await client.query(`
    INSERT INTO "member" (organization_id, user_id, role, created_at)
    SELECT o.id, u.id, 'owner'::organization_role, NOW()
    FROM "user" u, "organization" o
    WHERE u.email = 'jean@homefarmer.com' AND o.slug = 'jean-dupont-jardinage'
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  `)

  // ============================================================
  // 5. Profil Farmer
  // ============================================================
  await client.query(`
    INSERT INTO "farmer_profile" (
      organization_id, company_name, siret, vat_number,
      address_street, address_city, address_zip, country,
      is_sap_enabled, subscription_start_date, created_at, updated_at
    )
    SELECT
      o.id,
      'Jean Dupont Jardinage',
      '12345678900012',
      'FR12345678900',
      '5 Rue du Potager',
      'Versailles',
      '78000',
      'FR',
      true,
      NOW() - interval '3 months',
      NOW(), NOW()
    FROM "organization" o
    WHERE o.slug = 'jean-dupont-jardinage'
    ON CONFLICT (organization_id) DO NOTHING;
  `)

  // ============================================================
  // 6. 12 clients jardin réalistes
  // ============================================================
  await client.query(`
    INSERT INTO "garden_client" (
      organization_id, first_name, last_name, email, phone,
      address_street, address_city, address_zip,
      surface_sqm, exposure, soil_type, has_water_access, water_access_notes,
      access_digicode, access_portal_code, access_key_location, access_notes,
      photo_urls, has_tax_advantage, is_active, created_at, updated_at
    )
    SELECT
      o.id,
      c.first_name, c.last_name, c.email, c.phone,
      c.address_street, c.address_city, c.address_zip,
      c.surface_sqm::double precision, c.exposure::garden_exposure, c.soil_type::soil_type,
      c.has_water_access::boolean, c.water_access_notes,
      c.access_digicode, c.access_portal_code, c.access_key_location, c.access_notes,
      '{}'::text[], c.has_tax_advantage::boolean, c.is_active::boolean,
      (NOW() - (c.created_days_ago || ' days')::interval), NOW()
    FROM "organization" o,
    (VALUES
      ('Marie',    'Dupont',    'marie.dupont@email.com',    '06 12 34 56 78', '12 Rue des Lilas',       'Versailles',     '78000', 45,  'full_sun',      'loamy',  'true',  'Robinet extérieur côté garage',    '1234',  NULL,    NULL,                           'Chien gentil dans le jardin',       'true',  'true',  '90'),
      ('Pierre',   'Martin',    'pierre.martin@email.com',   '06 23 45 67 89', '45 Avenue de la Gare',   'Saint-Germain',  '78100', 80,  'partial_shade', 'clay',   'true',  'Récupérateur eau de pluie 500L',   NULL,    'A567',  NULL,                           NULL,                                 'true',  'true',  '85'),
      ('Sophie',   'Leroy',     'sophie.leroy@email.com',    '06 34 56 78 90', '8 Impasse Verte',        'Le Chesnay',     '78150', 30,  'full_sun',      'sandy',  'true',  'Tuyau arrosage en place',          NULL,    NULL,    'Sous le pot à droite du portail', NULL,                                 'true',  'true',  '75'),
      ('Michel',   'Bernard',   'michel.bernard@email.com',  '06 45 67 89 01', '22 Rue du Château',      'Versailles',     '78000', 120, 'full_sun',      'loamy',  'true',  'Arrosage automatique installé',    '5678',  '9012',  NULL,                           'Grand terrain, prévoir 2h',          'true',  'true',  '70'),
      ('Isabelle', 'Moreau',    'isabelle.moreau@email.com', '06 56 78 90 12', '15 Allée des Cerisiers', 'Bougival',       '78380', 55,  'partial_shade', 'chalky', 'false', NULL,                               NULL,    NULL,    NULL,                           'Apporter de l''eau. Pas de point d''eau', 'true', 'true', '60'),
      ('François', 'Petit',     'francois.petit@email.com',  '06 67 89 01 23', '3 Rue de la Fontaine',   'Marly-le-Roi',   '78160', 65,  'full_sun',      'silty',  'true',  'Robinet au fond du jardin',        NULL,    'B789',  NULL,                           'Portail automatique',                'true',  'true',  '55'),
      ('Catherine','Roux',      'catherine.roux@email.com',  '06 78 90 12 34', '28 Boulevard Victor Hugo','Rueil-Malmaison','92500', 40,  'full_shade',    'peaty',  'true',  'Tuyau fourni',                     '3456',  NULL,    'Boîte aux lettres',           'Potager en terrasses',               'true',  'true',  '50'),
      ('Alain',    'Fournier',  'alain.fournier@email.com',  '06 89 01 23 45', '17 Rue des Vignes',      'Chatou',         '78400', 90,  'full_sun',      'loamy',  'true',  'Double robinet + récupérateur',    NULL,    NULL,    NULL,                           'Terrain en pente légère',            'true',  'true',  '40'),
      ('Nathalie', 'Girard',    'nathalie.girard@email.com', '06 90 12 34 56', '6 Place du Marché',      'Louveciennes',   '78430', 35,  'partial_shade', 'sandy',  'true',  'Robinet cuisine accessible',       NULL,    'C123',  NULL,                           'Cour intérieure, accès par l''arrière', 'true', 'true', '30'),
      ('Philippe', 'Bonnet',    'philippe.bonnet@email.com', '06 01 23 45 67', '41 Rue de Paris',        'Garches',        '92380', 70,  'full_sun',      'clay',   'true',  'Goutte à goutte installé',         '7890',  NULL,    NULL,                           'Serre en fond de jardin',            'true',  'true',  '25'),
      ('Christine','Lambert',   'christine.lambert@email.com','06 11 22 33 44', '9 Chemin des Bois',     'Ville-d''Avray', '92410', 50,  'partial_shade', 'loamy',  'false', NULL,                               NULL,    NULL,    'Voisine Mme Garcia a la clé',  'Jardin partagé entre 2 voisins',     'true',  'true',  '15'),
      ('Robert',   'Thomas',    'robert.thomas@email.com',   '06 55 66 77 88', '33 Rue Nationale',       'Sèvres',         '92310', 25,  'full_shade',    'chalky', 'true',  'Petit robinet terrasse',           NULL,    'D456',  NULL,                           'Petit potager urbain en bacs',       'true',  'true',  '10')
    ) AS c(first_name, last_name, email, phone, address_street, address_city, address_zip, surface_sqm, exposure, soil_type, has_water_access, water_access_notes, access_digicode, access_portal_code, access_key_location, access_notes, has_tax_advantage, is_active, created_days_ago)
    WHERE o.slug = 'jean-dupont-jardinage'
    ON CONFLICT DO NOTHING;
  `)

  // ============================================================
  // 7. Interventions passées (completed) + futures (scheduled)
  // ============================================================
  await client.query(`
    INSERT INTO "intervention" (
      organization_id, garden_client_id, scheduled_date, duration_minutes,
      status, type, pro_notes, photo_urls, checklist_items, checklist_done,
      created_at, updated_at
    )
    SELECT
      o.id,
      gc.id,
      i.scheduled_date::timestamp,
      i.duration_minutes::double precision,
      i.status::intervention_status,
      i.type::intervention_type,
      i.pro_notes,
      '{}'::text[],
      i.checklist_items::text[],
      i.checklist_done::boolean[],
      i.scheduled_date::timestamp,
      i.scheduled_date::timestamp
    FROM "organization" o
    JOIN "garden_client" gc ON gc.organization_id = o.id
    JOIN (VALUES
      -- Interventions passées (completed)
      ('Marie',    'Dupont',   (NOW() - interval '21 days')::text,  90,  'completed', 'maintenance',      'Tonte pelouse, désherbage massifs, taille rosiers. Pucerons traités.',                        '{"Tonte pelouse","Désherbage massifs","Taille rosiers","Traitement pucerons"}', '{true,true,true,true}'),
      ('Pierre',   'Martin',   (NOW() - interval '18 days')::text,  120, 'completed', 'plantation',       'Plantation tomates, courgettes et basilic. Paillage installé.',                                '{"Plantation tomates","Plantation courgettes","Plantation basilic","Paillage"}', '{true,true,true,true}'),
      ('Sophie',   'Leroy',    (NOW() - interval '15 days')::text,  60,  'completed', 'maintenance',      'Entretien courant. Arrosage et vérification tuteurs.',                                          '{"Arrosage","Vérification tuteurs","Désherbage","Amendement"}', '{true,true,true,false}'),
      ('Michel',   'Bernard',  (NOW() - interval '14 days')::text,  150, 'completed', 'setup',            'Installation de 4 carrés potagers surélevés. Remplissage terre végétale.',                      '{"Montage carrés","Remplissage terre","Installation géotextile","Nivellement"}', '{true,true,true,true}'),
      ('Isabelle', 'Moreau',   (NOW() - interval '12 days')::text,  75,  'completed', 'maintenance',      'Entretien rosiers et arbustes. Ramassage feuilles mortes.',                                    '{"Taille rosiers","Ramassage feuilles","Binage","Compostage"}', '{true,true,true,true}'),
      ('François', 'Petit',    (NOW() - interval '10 days')::text,  90,  'completed', 'maintenance',      'Tonte et bordures. Nettoyage allées.',                                                          '{"Tonte","Bordures","Nettoyage allées","Arrosage"}', '{true,true,true,true}'),
      ('Marie',    'Dupont',   (NOW() - interval '7 days')::text,   90,  'completed', 'maintenance',      'Deuxième passage. Semis laitues et radis. Arrosage copieux.',                                  '{"Semis laitues","Semis radis","Arrosage","Vérification compost"}', '{true,true,true,true}'),
      ('Catherine','Roux',     (NOW() - interval '5 days')::text,   60,  'completed', 'consultation',     'Visite conseil pour aménagement potager en terrasses. Devis établi.',                           '{"Diagnostic terrain","Plan aménagement","Conseil variétés","Devis"}', '{true,true,true,true}'),
      ('Alain',    'Fournier', (NOW() - interval '3 days')::text,   120, 'completed', 'plantation',       'Plantation fraisiers et aromatiques. Installation petit tunnel.',                               '{"Plantation fraisiers","Plantation aromatiques","Installation tunnel","Paillage"}', '{true,true,true,true}'),

      -- Intervention en cours
      ('Pierre',   'Martin',   (NOW())::text,                        90,  'in_progress', 'maintenance',   'Entretien en cours. Taille haies commencée.',                                                   '{"Taille haies","Désherbage","Arrosage","Vérification tuteurs"}', '{true,false,false,false}'),

      -- Interventions futures (scheduled)
      ('Sophie',   'Leroy',    (NOW() + interval '1 day')::text,    60,  'scheduled', 'maintenance',      NULL,                                                                                             '{"Arrosage","Désherbage","Vérification semis","Récolte radis"}', '{false,false,false,false}'),
      ('Michel',   'Bernard',  (NOW() + interval '2 days')::text,   120, 'scheduled', 'plantation',       NULL,                                                                                             '{"Plantation salades","Plantation poireaux","Amendement","Paillage"}', '{false,false,false,false}'),
      ('Nathalie', 'Girard',   (NOW() + interval '3 days')::text,   75,  'scheduled', 'maintenance',      NULL,                                                                                             '{"Tonte","Taille arbustes","Arrosage","Nettoyage"}', '{false,false,false,false}'),
      ('Philippe', 'Bonnet',   (NOW() + interval '4 days')::text,   90,  'scheduled', 'maintenance',      NULL,                                                                                             '{"Entretien serre","Arrosage","Récolte tomates","Taille gourmands"}', '{false,false,false,false}'),
      ('Marie',    'Dupont',   (NOW() + interval '7 days')::text,   90,  'scheduled', 'maintenance',      NULL,                                                                                             '{"Tonte","Désherbage","Récolte","Arrosage"}', '{false,false,false,false}'),
      ('Christine','Lambert',  (NOW() + interval '8 days')::text,   60,  'scheduled', 'consultation',     NULL,                                                                                             '{"Diagnostic","Conseil rotation","Plan été","Devis complémentaire"}', '{false,false,false,false}'),
      ('Robert',   'Thomas',   (NOW() + interval '10 days')::text,  45,  'scheduled', 'maintenance',      NULL,                                                                                             '{"Arrosage bacs","Taille aromatiques","Vérification drainage"}', '{false,false,false,false}'),
      ('François', 'Petit',    (NOW() + interval '12 days')::text,  90,  'scheduled', 'harvest_support',  NULL,                                                                                             '{"Récolte pommes de terre","Récolte oignons","Stockage","Préparation sol"}', '{false,false,false,false}')
    ) AS i(first_name, last_name, scheduled_date, duration_minutes, status, type, pro_notes, checklist_items, checklist_done)
    ON gc.first_name = i.first_name AND gc.last_name = i.last_name
    WHERE o.slug = 'jean-dupont-jardinage'
    ON CONFLICT DO NOTHING;
  `)

  // ============================================================
  // 8. Récoltes (saisies par les clients)
  // ============================================================
  await client.query(`
    INSERT INTO "harvest" (
      organization_id, garden_client_id, harvest_date, crop_name,
      weight_kg, market_price_per_kg, calculated_value_eur, photo_url, created_at
    )
    SELECT
      o.id,
      gc.id,
      h.harvest_date::timestamp,
      h.crop_name,
      h.weight_kg::double precision,
      h.market_price_per_kg::decimal,
      h.calculated_value_eur::decimal,
      NULL,
      h.harvest_date::timestamp
    FROM "organization" o
    JOIN "garden_client" gc ON gc.organization_id = o.id
    JOIN (VALUES
      ('Marie',    'Dupont',   (NOW() - interval '10 days')::text, 'Tomates',          2.5,   5.00,  12.50),
      ('Marie',    'Dupont',   (NOW() - interval '8 days')::text,  'Basilic',           0.3,   25.00, 7.50),
      ('Marie',    'Dupont',   (NOW() - interval '3 days')::text,  'Radis',             0.8,   4.50,  3.60),
      ('Pierre',   'Martin',   (NOW() - interval '12 days')::text, 'Courgettes',        3.2,   3.50,  11.20),
      ('Pierre',   'Martin',   (NOW() - interval '5 days')::text,  'Tomates cerises',   1.0,   8.00,  8.00),
      ('Sophie',   'Leroy',    (NOW() - interval '7 days')::text,  'Laitue',            0.6,   6.00,  3.60),
      ('Michel',   'Bernard',  (NOW() - interval '6 days')::text,  'Haricots verts',    1.5,   7.50,  11.25),
      ('Michel',   'Bernard',  (NOW() - interval '2 days')::text,  'Fraises',           0.8,  12.00,  9.60),
      ('Alain',    'Fournier', (NOW() - interval '4 days')::text,  'Fraises',           1.2,  12.00,  14.40),
      ('Philippe', 'Bonnet',   (NOW() - interval '9 days')::text,  'Tomates',           4.0,   5.00,  20.00),
      ('Philippe', 'Bonnet',   (NOW() - interval '1 day')::text,   'Poivrons',          1.8,   6.50,  11.70),
      ('Nathalie', 'Girard',   (NOW() - interval '6 days')::text,  'Persil',            0.2,  20.00,  4.00),
      ('Catherine','Roux',     (NOW() - interval '11 days')::text, 'Menthe',            0.15, 30.00,  4.50)
    ) AS h(first_name, last_name, harvest_date, crop_name, weight_kg, market_price_per_kg, calculated_value_eur)
    ON gc.first_name = h.first_name AND gc.last_name = h.last_name
    WHERE o.slug = 'jean-dupont-jardinage'
    ON CONFLICT DO NOTHING;
  `)

  // ============================================================
  // 9. Paramètres d'application
  // ============================================================
  await client.query(`
    INSERT INTO "app_settings" ("key", "value", "type", "category", "label", "description", "updated_at")
    VALUES
      ('email.enabled', 'true', 'boolean', 'email', 'Activer emails', 'Toggle principal envoi emails', NOW()),
      ('email.enabled_for_admins', 'true', 'boolean', 'email', 'Emails admin', 'Envoyer les emails aux admins', NOW()),
      ('email.enabled_for_clients', 'true', 'boolean', 'email', 'Emails clients', 'Envoyer les emails aux clients', NOW()),
      ('email.communication_email', 'contact@myhomefarmer.com', 'string', 'email', 'Email de communication', 'Adresse reply-to', NOW()),
      ('general.maintenance_mode', 'false', 'boolean', 'general', 'Mode maintenance', 'Afficher page maintenance', NOW()),
      ('general.maintenance_message', '', 'string', 'general', 'Message maintenance', 'Message affiché en maintenance', NOW())
    ON CONFLICT (key) DO NOTHING;
  `)

  // ============================================================
  // 10. Paramètres utilisateur
  // ============================================================
  await client.query(`
    INSERT INTO "user_settings" (
      "user_id", "theme", "language", "timezone", "two_factor_type",
      "enable_email_notifications", "enable_push_notifications",
      "notification_channel", "email_digest", "marketing_emails",
      "created_at", "updated_at"
    )
    SELECT
      u.id,
      CASE WHEN u.email = 'superadmin@myhomefarmer.com' THEN 'system' ELSE 'light' END::theme_type,
      'fr'::language_type,
      'Europe/Paris',
      'otp'::two_factor_type,
      true, true, 'both'::notification_channel, true, false,
      NOW(), NOW()
    FROM "user" u
    WHERE u.email IN ('superadmin@myhomefarmer.com', 'jean@homefarmer.com')
    ON CONFLICT (user_id) DO NOTHING;
  `)

  const end = Date.now()

  console.log(`✅ Seed MyHomeFarmer inséré en ${end - start}ms`)
  console.log('')
  console.log('🌱 Plans MHF :')
  console.log('  Graine (gratuit, 1 client)')
  console.log('  Pousse (9€/mois early bird → 49€/mois, ≤20 clients)')
  console.log('  Récolte FR (39€/mois early bird → 99€/mois, illimité + SAP)')
  console.log('  Récolte BE/CH (29€/mois early bird → 69€/mois, illimité)')
  console.log('')
  console.log('👤 Comptes (mot de passe = "password") :')
  console.log('  superadmin@myhomefarmer.com  (SuperAdmin)')
  console.log('  jean@homefarmer.com          (Farmer — Jean Dupont)')
  console.log('')
  console.log('🏢 Organisation : Jean Dupont Jardinage (Versailles)')
  console.log('')
  console.log('👥 12 clients jardin :')
  console.log(
    '  Marie Dupont (Versailles)        — 45m², plein soleil, limoneux'
  )
  console.log('  Pierre Martin (Saint-Germain)     — 80m², mi-ombre, argileux')
  console.log(
    '  Sophie Leroy (Le Chesnay)         — 30m², plein soleil, sablonneux'
  )
  console.log(
    '  Michel Bernard (Versailles)       — 120m², plein soleil, limoneux'
  )
  console.log('  Isabelle Moreau (Bougival)         — 55m², mi-ombre, calcaire')
  console.log(
    '  François Petit (Marly-le-Roi)     — 65m², plein soleil, silteux'
  )
  console.log('  Catherine Roux (Rueil-Malmaison)  — 40m², ombre, tourbeux')
  console.log(
    '  Alain Fournier (Chatou)            — 90m², plein soleil, limoneux'
  )
  console.log(
    '  Nathalie Girard (Louveciennes)     — 35m², mi-ombre, sablonneux'
  )
  console.log(
    '  Philippe Bonnet (Garches)          — 70m², plein soleil, argileux'
  )
  console.log("  Christine Lambert (Ville-d'Avray) — 50m², mi-ombre, limoneux")
  console.log('  Robert Thomas (Sèvres)             — 25m², ombre, calcaire')
  console.log('')
  console.log('📋 18 interventions : 9 terminées, 1 en cours, 8 planifiées')
  console.log('🥬 13 récoltes saisies (tomates, courgettes, fraises, etc.)')
  console.log('')

  process.exit(0)
}

export default seed

try {
  await seed()
} catch (error) {
  console.error('❌ Seed failed')
  console.error(error)
  process.exit(1)
}
