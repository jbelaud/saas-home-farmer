'use server'

import {isRedirectError} from 'next/dist/client/components/redirect-error'
import {redirect} from 'next/navigation'
import {AuthError} from 'next-auth'

import {
  authLoginFormSchema,
  authRegisterFormSchema,
} from '@/components/features/auth/auth-form-validation'
import {signIn, signOut} from '@/lib/next-auth/next-auth'
//import {authClient} from '@/lib/better-auth/auth-client' //import the auth client
//import {signIn, signOut} from '@/lib/next-auth/next-auth'
import {isValidationParsedZodError} from '@/services/errors/validation-error'
import {
  createUserOrganizationService,
  getUserByEmailService,
  isEmailAvailableService,
} from '@/services/facades/user-service-facade'

type LoginValidationError = {
  field: keyof typeof authLoginFormSchema._type
  message: string
}

type RegisterValidationError = {
  field: keyof typeof authRegisterFormSchema._type
  message: string
}

type LoginFormState = {
  success: boolean
  errors?: LoginValidationError[]
  message?: string
}

type RegisterFormState = {
  success: boolean
  errors?: RegisterValidationError[]
  message?: string
}

/**
 * Action de login utilisant NextAuth
 */
export async function loginAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  console.log('login appelé')
  try {
    // Validation Zod des données du formulaire
    const validationResult = authLoginFormSchema.safeParse({
      email: formData.get('email'),
    })

    if (!validationResult.success) {
      const validationErrors: LoginValidationError[] =
        validationResult.error.errors.map((err) => ({
          field: err.path[0] as keyof typeof authLoginFormSchema._type,
          message: err.message,
        }))
      return {
        success: false,
        message: 'Erreur de validation',
        errors: validationErrors,
      }
    }

    const {email} = validationResult.data

    // Vérifier si l'utilisateur existe en base de données
    try {
      const user = await getUserByEmailService(email)

      if (!user) {
        return {
          success: false,
          message: 'Aucun compte trouvé avec cet email',
          errors: [
            {
              field: 'email',
              message: 'Aucun compte trouvé avec cet email',
            },
          ],
        }
      }

      console.log('Utilisateur trouvé:', user.email)
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error)
      return {
        success: false,
        message: "Une erreur est survenue lors de la vérification de l'email",
        errors: [
          {
            field: 'email',
            message:
              "Une erreur est survenue lors de la vérification de l'email",
          },
        ],
      }
    }

    console.log(' avant signIn', email)
    await signIn('resend', {
      email,
      redirect: false,
    })
    console.log(' après signIn')
    redirect('/verify-request')
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.log(' erreur', error)
    if (error instanceof AuthError) {
      return {
        success: false,
        message: 'Identifiants invalides',
        errors: [
          {
            field: 'email',
            message: 'Identifiants invalides',
          },
        ],
      }
    }

    return {
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
      errors: [
        {
          field: 'email',
          message: 'Une erreur est survenue lors de la connexion',
        },
      ],
    }
  }
}

/**
 * Action d'inscription d'un nouvel utilisateur
 */
export async function registerAction(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // Validation Zod des données du formulaire
  const validationResult = authRegisterFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validationResult.success) {
    const validationErrors: RegisterValidationError[] =
      validationResult.error.errors.map((err) => ({
        field: err.path[0] as keyof typeof authRegisterFormSchema._type,
        message: err.message,
      }))
    return {
      success: false,
      message: 'Erreur de validation',
      errors: validationErrors,
    }
  }

  const {name, email} = validationResult.data

  // Vérifier si l'email est disponible
  const isEmailAvailable = await isEmailAvailableService(email)
  if (!isEmailAvailable) {
    return {
      success: false,
      errors: [
        {
          field: 'email',
          message: 'Cet email est déjà utilisé',
        },
      ],
    }
  }

  // Créer l'utilisateur et son organisation dans la base de données
  try {
    const result = await createUserOrganizationService({
      name,
      email,
      //password,
    })

    await signIn('resend', {
      email: result.user.email,
      //password: result.user.password, //not used with Resend
      redirect: false,
    })

    console.log('Utilisateur et organisation créés:', result)

    redirect('/verify-request')
  } catch (error) {
    if (isRedirectError(error)) {
      console.log('Erreur de redirection:', error)
      throw error
    }
    // Si l'erreur est une erreur de validation Zod au niveau Service
    const validationError = isValidationParsedZodError(error)

    if (validationError) {
      return {
        success: false,
        message: `Erreur de validation : ${error.message}`,
        errors: error.zodErrorFields?.errors.map((err) => ({
          field: err.path[0] as keyof typeof authRegisterFormSchema._type,
          message: err.message,
        })),
      }
    }
    // Si l'erreur est une erreur technique generique
    return {
      success: false,
      message:
        error instanceof Error
          ? `Error technique : ${error.message}`
          : 'Une erreur est survenue lors de la création du compte',
      errors: [],
    }
  }
}

/**
 * Action pour l'inscription avec un provider OAuth (Google, Apple)
 */
export async function registerProviderAction(
  provider: 'google' | 'apple'
): Promise<LoginFormState> {
  console.log('registerProviderAction appelé', provider)
  try {
    // Rediriger vers la page de connexion du provider
    await signIn(provider, {
      callbackUrl: '/dashboard',
      redirect: false,
    })

    return {
      success: true,
      message: 'Redirection vers le provider...',
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    console.error('Erreur lors de la connexion avec le provider:', error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la connexion avec le provider',
      errors: [
        {
          field: 'email',
          message:
            error instanceof Error
              ? error.message
              : 'Une erreur est survenue lors de la connexion avec le provider',
        },
      ],
    }
  }
}

export async function logoutAction() {
  await signOut()
}
