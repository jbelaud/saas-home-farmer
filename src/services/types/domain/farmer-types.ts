import {
  AddFarmerProfileModel,
  AddGardenClientModel,
  AddHarvestModel,
  AddInterventionModel,
  AddInvoiceModel,
  CountryEnumModel,
  FarmerProfileModel,
  GardenClientModel,
  GardenExposureEnumModel,
  HarvestModel,
  InterventionModel,
  InterventionStatusEnumModel,
  InterventionTypeEnumModel,
  InvoiceModel,
  InvoiceStatusEnumModel,
  InvoiceTypeEnumModel,
  SoilTypeEnumModel,
  UpdateFarmerProfileModel,
  UpdateGardenClientModel,
  UpdateHarvestModel,
  UpdateInterventionModel,
  UpdateInvoiceModel,
} from '@/db/models/farmer-model'

// ============================================================
// TYPES DE DOMAINE : FarmerProfile
// ============================================================

export type FarmerProfile = FarmerProfileModel
export type Country = CountryEnumModel

export type CreateFarmerProfile = AddFarmerProfileModel
export type UpdateFarmerProfile = {
  id: string
} & Partial<Omit<UpdateFarmerProfileModel, 'id'>>

// ============================================================
// TYPES DE DOMAINE : GardenClient
// ============================================================

export type GardenClient = GardenClientModel
export type GardenExposure = GardenExposureEnumModel
export type SoilType = SoilTypeEnumModel

export type CreateGardenClient = AddGardenClientModel
export type UpdateGardenClient = {
  id: string
} & Partial<Omit<UpdateGardenClientModel, 'id'>>

// Type enrichi avec les relations (pour affichage liste/détail)
export type GardenClientWithStats = GardenClient & {
  totalHarvestValueEur?: number
  totalHarvestWeightKg?: number
  lastInterventionDate?: Date | null
  interventionCount?: number
}

// DTO pour les listes (données minimales pour les cartes)
export type GardenClientCardDTO = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  addressCity: string
  addressZip: string
  isActive: boolean
  hasTaxAdvantage: boolean
}

// ============================================================
// TYPES DE DOMAINE : Intervention
// ============================================================

export type Intervention = InterventionModel
export type InterventionStatus = InterventionStatusEnumModel
export type InterventionType = InterventionTypeEnumModel

export type CreateIntervention = AddInterventionModel
export type UpdateIntervention = {
  id: string
} & Partial<Omit<UpdateInterventionModel, 'id'>>

// Type enrichi avec le client associé
export type InterventionWithClient = Intervention & {
  gardenClient?: GardenClient
}

// Item de checklist pour le rapport d'intervention (Mobile-First)
export type ChecklistItem = {
  label: string
  done: boolean
}

// DTO pour l'agenda (vue calendrier)
export type InterventionAgendaDTO = {
  id: string
  scheduledDate: Date
  status: InterventionStatus
  type: InterventionType
  clientFirstName: string
  clientLastName: string
  clientAddressCity: string
  durationMinutes: number | null
}

// ============================================================
// TYPES DE DOMAINE : Harvest
// ============================================================

export type Harvest = HarvestModel
export type CreateHarvest = AddHarvestModel
export type UpdateHarvest = {
  id: string
} & Partial<Omit<UpdateHarvestModel, 'id'>>

// Type enrichi avec le client
export type HarvestWithClient = Harvest & {
  gardenClient?: GardenClient
}

// Stats agrégées pour le dashboard ROI
export type HarvestStats = {
  totalWeightKg: number
  totalValueEur: number
  count: number
  byYear?: {year: number; totalValueEur: number; totalWeightKg: number}[]
  byCrop?: {cropName: string; totalWeightKg: number; totalValueEur: number}[]
}

// ============================================================
// TYPES DE DOMAINE : Invoice
// ============================================================

export type Invoice = InvoiceModel
export type InvoiceStatus = InvoiceStatusEnumModel
export type InvoiceType = InvoiceTypeEnumModel

export type CreateInvoice = AddInvoiceModel
export type UpdateInvoice = {
  id: string
} & Partial<Omit<UpdateInvoiceModel, 'id'>>

// Type enrichi avec le client
export type InvoiceWithClient = Invoice & {
  gardenClient?: GardenClient
}

// DTO pour la liste des factures
export type InvoiceListDTO = {
  id: string
  invoiceNumber: string
  type: InvoiceType
  status: InvoiceStatus
  clientFullName: string
  issueDate: Date
  dueDate: Date | null
  amountTtc: number
  pdfUrl: string | null
}

// ============================================================
// CONSTANTES D'ENUM (pour éviter les magic strings)
// ============================================================

export const InterventionStatusConst = {
  scheduled: 'scheduled',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
} satisfies Record<InterventionStatus, string>

export const InterventionTypeConst = {
  maintenance: 'maintenance',
  plantation: 'plantation',
  setup: 'setup',
  harvest_support: 'harvest_support',
  consultation: 'consultation',
} satisfies Record<InterventionType, string>

export const InvoiceStatusConst = {
  draft: 'draft',
  sent: 'sent',
  paid: 'paid',
  overdue: 'overdue',
  cancelled: 'cancelled',
} satisfies Record<InvoiceStatus, string>

export const InvoiceTypeConst = {
  quote: 'quote',
  invoice: 'invoice',
} satisfies Record<InvoiceType, string>

export const CountryConst = {
  FR: 'FR',
  BE: 'BE',
  CH: 'CH',
  OTHER: 'OTHER',
} satisfies Record<Country, string>
