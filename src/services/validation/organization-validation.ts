import {z} from 'zod'

import {
  CreateOrganization,
  CreateUserOrganization,
  Organization,
  OrganizationRole,
  UpdateOrganization,
  UserOrganizationRoleConst,
} from '../types/domain/organization-types'

export const baseOrganizationServiceSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Le nom doit contenir au moins 2 caractères.',
    })
    .max(100, {
      message: 'Le nom ne doit pas contenir plus de 100 caractères.',
    }),
  slug: z
    .string()
    .min(2, {
      message: 'Le slug doit contenir au moins 2 caractères.',
    })
    .max(100, {
      message: 'Le slug ne doit pas contenir plus de 100 caractères.',
    })
    .regex(/^[a-z0-9-]+$/, {
      message:
        'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.',
    }),
}) satisfies z.Schema<Pick<Organization, 'name' | 'slug'>>

export const createOrganizationServiceSchema =
  baseOrganizationServiceSchema.extend({
    description: z.string().optional(),
    image: z.string().optional(),
  }) satisfies z.Schema<CreateOrganization>

export const updateOrganizationServiceSchema =
  baseOrganizationServiceSchema.extend({
    id: z.string().uuid(),
    description: z.string().optional(),
    image: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }) satisfies z.Schema<UpdateOrganization>

export const organizationRoleSchema = z.enum([
  UserOrganizationRoleConst.OWNER,
  UserOrganizationRoleConst.ADMIN,
  UserOrganizationRoleConst.MEMBER,
]) satisfies z.Schema<OrganizationRole>

export const createUserOrganizationServiceSchema = z.object({
  userId: z.string().uuid({
    message: "L'identifiant utilisateur n'est pas valide.",
  }),
  organizationId: z.string().uuid({
    message: "L'identifiant organisation n'est pas valide.",
  }),
  role: organizationRoleSchema.default(UserOrganizationRoleConst.MEMBER),
}) satisfies z.Schema<CreateUserOrganization>

export const organizationUuidSchema = z.string().uuid({
  message: "L'identifiant organisation n'est pas valide.",
})

export const userUuidSchema = z.string().uuid({
  message: "L'identifiant utilisateur n'est pas valide.",
})
