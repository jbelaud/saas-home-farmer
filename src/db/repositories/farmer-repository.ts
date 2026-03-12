import {eq, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddFarmerProfileModel,
  FarmerProfileModel,
  farmerProfiles,
  UpdateFarmerProfileModel,
} from '@/db/models/farmer-model'

// ============================================================
// CRUD : farmer_profile
// ============================================================

export const createFarmerProfileDao = async (
  profile: AddFarmerProfileModel
): Promise<FarmerProfileModel> => {
  const rows = await db.insert(farmerProfiles).values(profile).returning()
  return rows[0]
}

export const getFarmerProfileByIdDao = async (
  id: string
): Promise<FarmerProfileModel | undefined> => {
  return db.query.farmerProfiles.findFirst({
    where: (fp, {eq}) => eq(fp.id, id),
  })
}

export const getFarmerProfileByOrganizationIdDao = async (
  organizationId: string
): Promise<FarmerProfileModel | undefined> => {
  return db.query.farmerProfiles.findFirst({
    where: (fp, {eq}) => eq(fp.organizationId, organizationId),
  })
}

export const updateFarmerProfileDao = async (
  profile: UpdateFarmerProfileModel
): Promise<void> => {
  if (!profile.id) {
    throw new Error('FarmerProfile ID is required')
  }
  await db
    .update(farmerProfiles)
    .set({...profile, updatedAt: new Date()})
    .where(eq(farmerProfiles.id, profile.id))
}

export const deleteFarmerProfileDao = async (id: string): Promise<void> => {
  await db.delete(farmerProfiles).where(eq(farmerProfiles.id, id))
}

export const getAllFarmerProfilesCountDao = async (): Promise<number> => {
  const [{count}] = await db
    .select({count: sql<number>`count(*)`})
    .from(farmerProfiles)
  return count
}
