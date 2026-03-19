import {relations, sql} from 'drizzle-orm'
import {
  boolean,
  decimal,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import {organization} from './auth-model'

// ============================================================
// ENUMS MÉTIER
// ============================================================

// Segmentation géographique (pour les plans tarifaires)
export const countryEnum = pgEnum('country', ['FR', 'BE', 'CH', 'OTHER'])

// Exposition du potager
export const gardenExposureEnum = pgEnum('garden_exposure', [
  'full_sun',
  'partial_shade',
  'full_shade',
])

// Type de sol
export const soilTypeEnum = pgEnum('soil_type', [
  'clay',
  'sandy',
  'loamy',
  'chalky',
  'peaty',
  'silty',
])

// ============================================================
// TABLE: farmer_profile
// Profil métier de l'entrepreneur jardinier (Farmer = Organization)
// ============================================================
export const farmerProfiles = pgTable('farmer_profile', {
  id: uuid('id')
    .default(sql`uuid_generate_v4()`)
    .primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .unique()
    .references(() => organization.id, {onDelete: 'cascade'}),
  // Infos légales
  companyName: text('company_name'),
  siret: text('siret'),
  vatNumber: text('vat_number'),
  // Adresse professionnelle
  addressStreet: text('address_street'),
  addressCity: text('address_city'),
  addressZip: text('address_zip'),
  country: countryEnum('country').default('FR').notNull(),
  // Segmentation fiscale (France = module SAP activé)
  isSapEnabled: boolean('is_sap_enabled').default(false).notNull(),
  // Date de début d'abonnement (pour Early Bird 12 mois)
  subscriptionStartDate: timestamp('subscription_start_date', {
    mode: 'date',
  }),
  createdAt: timestamp('created_at', {mode: 'date'}).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', {mode: 'date'}).defaultNow().notNull(),
})

// ============================================================
// RELATIONS : farmer_profile
// ============================================================
export const farmerProfilesRelations = relations(
  farmerProfiles,
  ({one, many}) => ({
    organization: one(organization, {
      fields: [farmerProfiles.organizationId],
      references: [organization.id],
    }),
    gardenClients: many(gardenClients),
  })
)

// ============================================================
// TABLE: garden_client
// Le client du Farmer (particulier avec son potager)
// ============================================================
export const gardenClients = pgTable(
  'garden_client',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),
    // Appartient à un Farmer (via son Organization)
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, {onDelete: 'cascade'}),
    // Lien optionnel vers un compte Better Auth (si le client a un compte)
    userId: uuid('user_id'),
    // Infos personnelles
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    // Adresse du potager (peut différer du domicile)
    addressStreet: text('address_street').notNull(),
    addressCity: text('address_city').notNull(),
    addressZip: text('address_zip').notNull(),
    // Détails du terrain
    surfaceSqm: doublePrecision('surface_sqm'),
    exposure: gardenExposureEnum('exposure'),
    soilType: soilTypeEnum('soil_type'),
    hasWaterAccess: boolean('has_water_access').default(false).notNull(),
    waterAccessNotes: text('water_access_notes'),
    // Infos d'accès (sensibles)
    accessDigicode: text('access_digicode'),
    accessPortalCode: text('access_portal_code'),
    accessKeyLocation: text('access_key_location'),
    accessNotes: text('access_notes'),
    // Photos du jardin avant intervention (URLs Supabase Storage)
    photoUrls: text('photo_urls').array().default([]).notNull(),
    // Avantage fiscal (crédit d'impôt 50% SAP - France uniquement)
    hasTaxAdvantage: boolean('has_tax_advantage').default(false).notNull(),
    // Token d'accès au portail client (magic link simplifié)
    accessToken: uuid('access_token')
      .default(sql`uuid_generate_v4()`)
      .notNull(),
    // Fréquence de visite cible (en jours, par défaut ~21 jours = 3 semaines)
    visitFrequencyDays: integer('visit_frequency_days').default(21).notNull(),
    // Date de la prochaine visite prévue (calculée ou saisie manuellement)
    nextVisitDate: timestamp('next_visit_date', {mode: 'date'}),
    // Statut du client
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', {mode: 'date'}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {mode: 'date'}).defaultNow().notNull(),
  },
  (table) => [
    index('garden_client_organization_id_idx').on(table.organizationId),
    index('garden_client_is_active_idx').on(table.isActive),
    index('garden_client_created_at_idx').on(table.createdAt),
    uniqueIndex('garden_client_access_token_unique').on(table.accessToken),
  ]
)

// ============================================================
// RELATIONS : garden_client
// ============================================================
export const gardenClientsRelations = relations(
  gardenClients,
  ({one, many}) => ({
    organization: one(organization, {
      fields: [gardenClients.organizationId],
      references: [organization.id],
    }),
    farmerProfile: one(farmerProfiles, {
      fields: [gardenClients.organizationId],
      references: [farmerProfiles.organizationId],
    }),
    interventions: many(interventions),
    harvests: many(harvests),
    invoices: many(invoices),
  })
)

// ============================================================
// ENUMS : Intervention
// ============================================================
export const interventionStatusEnum = pgEnum('intervention_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
])

export const interventionTypeEnum = pgEnum('intervention_type', [
  'maintenance',
  'plantation',
  'setup',
  'harvest_support',
  'consultation',
])

// ============================================================
// TABLE: intervention
// Le rapport de visite du Farmer chez le Client
// ============================================================
export const interventions = pgTable(
  'intervention',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),
    // Lien Farmer (tenant)
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, {onDelete: 'cascade'}),
    // Lien Client
    gardenClientId: uuid('garden_client_id')
      .notNull()
      .references(() => gardenClients.id, {onDelete: 'cascade'}),
    // Planification
    scheduledDate: timestamp('scheduled_date', {mode: 'date'}).notNull(),
    durationMinutes: doublePrecision('duration_minutes'),
    // Statut et type
    status: interventionStatusEnum('status').default('scheduled').notNull(),
    type: interventionTypeEnum('type').default('maintenance').notNull(),
    // Rapport
    proNotes: text('pro_notes'),
    // Photos (tableau d'URLs Supabase Storage)
    photoUrls: text('photo_urls').array().default([]).notNull(),
    // Checklist des tâches effectuées (JSON : [{task, done}])
    checklistItems: text('checklist_items').array().default([]).notNull(),
    // Checklist des tâches complétées (booléens associés)
    checklistDone: boolean('checklist_done').array().default([]).notNull(),
    createdAt: timestamp('created_at', {mode: 'date'}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {mode: 'date'}).defaultNow().notNull(),
  },
  (table) => [
    index('intervention_organization_id_idx').on(table.organizationId),
    index('intervention_garden_client_id_idx').on(table.gardenClientId),
    index('intervention_scheduled_date_idx').on(table.scheduledDate),
    index('intervention_status_idx').on(table.status),
    index('intervention_org_date_idx').on(
      table.organizationId,
      table.scheduledDate
    ),
  ]
)

// ============================================================
// RELATIONS : intervention
// ============================================================
export const interventionsRelations = relations(interventions, ({one}) => ({
  organization: one(organization, {
    fields: [interventions.organizationId],
    references: [organization.id],
  }),
  gardenClient: one(gardenClients, {
    fields: [interventions.gardenClientId],
    references: [gardenClients.id],
  }),
}))

// ============================================================
// TABLE: harvest
// Récoltes saisies par le Client (calcul valeur produite)
// ============================================================
export const harvests = pgTable(
  'harvest',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),
    // Lien Farmer (tenant, pour isolation des données)
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, {onDelete: 'cascade'}),
    // Lien Client
    gardenClientId: uuid('garden_client_id')
      .notNull()
      .references(() => gardenClients.id, {onDelete: 'cascade'}),
    // Données de récolte
    harvestDate: timestamp('harvest_date', {mode: 'date'}).notNull(),
    cropName: text('crop_name').notNull(),
    weightKg: doublePrecision('weight_kg').notNull(),
    // Prix bio du marché au moment de la récolte (EUR/kg)
    marketPricePerKg: decimal('market_price_per_kg', {
      precision: 10,
      scale: 4,
    }).notNull(),
    // Valeur calculée = weightKg * marketPricePerKg
    calculatedValueEur: decimal('calculated_value_eur', {
      precision: 10,
      scale: 2,
    }).notNull(),
    // Photo optionnelle de la récolte
    photoUrl: text('photo_url'),
    createdAt: timestamp('created_at', {mode: 'date'}).defaultNow().notNull(),
  },
  (table) => [
    index('harvest_organization_id_idx').on(table.organizationId),
    index('harvest_garden_client_id_idx').on(table.gardenClientId),
    index('harvest_date_idx').on(table.harvestDate),
    index('harvest_org_client_idx').on(
      table.organizationId,
      table.gardenClientId
    ),
  ]
)

// ============================================================
// RELATIONS : harvest
// ============================================================
export const harvestsRelations = relations(harvests, ({one}) => ({
  organization: one(organization, {
    fields: [harvests.organizationId],
    references: [organization.id],
  }),
  gardenClient: one(gardenClients, {
    fields: [harvests.gardenClientId],
    references: [gardenClients.id],
  }),
}))

// ============================================================
// ENUMS : Invoice
// ============================================================
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
])

export const invoiceTypeEnum = pgEnum('invoice_type', ['quote', 'invoice'])

// ============================================================
// TABLE: invoice
// Devis et factures du Farmer pour ses Clients
// ============================================================
export const invoices = pgTable(
  'invoice',
  {
    id: uuid('id')
      .default(sql`uuid_generate_v4()`)
      .primaryKey(),
    // Lien Farmer (tenant)
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, {onDelete: 'cascade'}),
    // Lien Client
    gardenClientId: uuid('garden_client_id')
      .notNull()
      .references(() => gardenClients.id, {onDelete: 'cascade'}),
    // Type et statut
    type: invoiceTypeEnum('type').default('invoice').notNull(),
    status: invoiceStatusEnum('status').default('draft').notNull(),
    // Numéro de document (ex: FA-2024-001)
    invoiceNumber: text('invoice_number').notNull(),
    // Dates
    issueDate: timestamp('issue_date', {mode: 'date'}).notNull(),
    dueDate: timestamp('due_date', {mode: 'date'}),
    // Montants (HT/TVA/TTC) - decimal pour éviter les erreurs d'arrondi flottant
    amountHt: decimal('amount_ht', {precision: 10, scale: 2}).notNull(),
    vatRate: decimal('vat_rate', {precision: 5, scale: 4})
      .default('0')
      .notNull(),
    amountTtc: decimal('amount_ttc', {precision: 10, scale: 2}).notNull(),
    // Lien PDF généré (Supabase Storage)
    pdfUrl: text('pdf_url'),
    // Notes internes
    notes: text('notes'),
    createdAt: timestamp('created_at', {mode: 'date'}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {mode: 'date'}).defaultNow().notNull(),
  },
  (table) => [
    index('invoice_organization_id_idx').on(table.organizationId),
    index('invoice_garden_client_id_idx').on(table.gardenClientId),
    index('invoice_status_idx').on(table.status),
    index('invoice_issue_date_idx').on(table.issueDate),
    uniqueIndex('invoice_number_org_unique').on(
      table.invoiceNumber,
      table.organizationId
    ),
  ]
)

// ============================================================
// RELATIONS : invoice
// ============================================================
export const invoicesRelations = relations(invoices, ({one}) => ({
  organization: one(organization, {
    fields: [invoices.organizationId],
    references: [organization.id],
  }),
  gardenClient: one(gardenClients, {
    fields: [invoices.gardenClientId],
    references: [gardenClients.id],
  }),
}))

// ============================================================
// TYPES TYPESCRIPT INFÉRÉS
// ============================================================

export type FarmerProfileModel = typeof farmerProfiles.$inferSelect
export type AddFarmerProfileModel = typeof farmerProfiles.$inferInsert
export type UpdateFarmerProfileModel = typeof farmerProfiles.$inferInsert

export type GardenClientModel = typeof gardenClients.$inferSelect
export type AddGardenClientModel = typeof gardenClients.$inferInsert
export type UpdateGardenClientModel = typeof gardenClients.$inferInsert

export type InterventionModel = typeof interventions.$inferSelect
export type AddInterventionModel = typeof interventions.$inferInsert
export type UpdateInterventionModel = typeof interventions.$inferInsert

export type HarvestModel = typeof harvests.$inferSelect
export type AddHarvestModel = typeof harvests.$inferInsert
export type UpdateHarvestModel = typeof harvests.$inferInsert

export type InvoiceModel = typeof invoices.$inferSelect
export type AddInvoiceModel = typeof invoices.$inferInsert
export type UpdateInvoiceModel = typeof invoices.$inferInsert

// Enum types
export type CountryEnumModel = (typeof countryEnum.enumValues)[number]
export type GardenExposureEnumModel =
  (typeof gardenExposureEnum.enumValues)[number]
export type SoilTypeEnumModel = (typeof soilTypeEnum.enumValues)[number]
export type InterventionStatusEnumModel =
  (typeof interventionStatusEnum.enumValues)[number]
export type InterventionTypeEnumModel =
  (typeof interventionTypeEnum.enumValues)[number]
export type InvoiceStatusEnumModel =
  (typeof invoiceStatusEnum.enumValues)[number]
export type InvoiceTypeEnumModel = (typeof invoiceTypeEnum.enumValues)[number]
