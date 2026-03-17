import {
  AddFarmerProfileModel,
  CountryEnumModel,
  FarmerProfileModel,
} from '@/db/models/farmer-model'
import {
  createFarmerProfileDao,
  getFarmerProfileByOrganizationIdDao,
} from '@/db/repositories/farmer-repository'

// ============================================================
// FARMER PROFILE SERVICE
// ============================================================

export const createFarmerProfileService = async (
  profile: AddFarmerProfileModel
): Promise<FarmerProfileModel> => {
  return createFarmerProfileDao(profile)
}

export const getFarmerProfileByOrganizationIdService = async (
  organizationId: string
): Promise<FarmerProfileModel | undefined> => {
  return getFarmerProfileByOrganizationIdDao(organizationId)
}

// ============================================================
// ONBOARDING SERVICE
// ============================================================

export type OnboardingData = {
  userId: string
  firstName: string
  lastName: string
  companyName: string
  country: CountryEnumModel
}

export const initializeFarmerOnboardingService = async (
  organizationId: string,
  data: Pick<OnboardingData, 'companyName' | 'country'>
): Promise<FarmerProfileModel> => {
  const isSapEnabled = data.country === 'FR'

  return createFarmerProfileDao({
    organizationId,
    companyName: data.companyName,
    country: data.country,
    isSapEnabled,
    subscriptionStartDate: new Date(),
  })
}
