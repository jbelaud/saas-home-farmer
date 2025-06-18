'use server'

import {isRedirectError} from 'next/dist/client/components/redirect-error'
import {headers} from 'next/headers'
import {redirect} from 'next/navigation'

import {
  authLoginFormSchema,
  authMagicLinkFormSchema,
  authRegisterFormSchema,
} from '@/components/features/auth/auth-form-validation'
import {auth, requireEmailVerification} from '@/lib/better-auth/auth' // path to your Better Auth server instance
import {isValidationParsedZodError} from '@/services/errors/validation-error'
import {
  createOrganizationForUserService,
  getUserByEmailService,
  isEmailAvailableService,
} from '@/services/facades/user-service-facade'
//import {APIError} from 'better-auth'

type LoginValidationError = {
  field: keyof typeof authLoginFormSchema._type
  message: string
}

type RegisterValidationError = {
  field: keyof typeof authRegisterFormSchema._type
  message: string
}

type MagicLinkValidationError = {
  field: keyof typeof authMagicLinkFormSchema._type
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

type MagicLinkFormState = {
  success: boolean
  errors?: MagicLinkValidationError[]
  message?: string
}

/**
 * Action de connexion avec les credentials email/password
 *
 * @param prevState
 * @param formData
 * @returns
 */
export async function loginCredentialAction(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  try {
    // 1. Validation Server Zod des données du formulaire
    const validationResult = authLoginFormSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
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

    const {email, password} = validationResult.data

    // 2. verification de l'email en bdd (optionel)
    const user = await getUserByEmailService(email)

    if (!user) {
      return {
        success: false,
        message: 'Aucun compte trouvé avec cet email',
      }
    }

    // 3. connexion avec better auth
    const response = await auth.api.signInEmail({
      body: {
        email,
        password: password ?? '',
      },
      asResponse: false, // returns a response object instead of data
    })

    // const response2 = await auth.api.sendTwoFactorOTP({
    //   headers: response.headers,
    //   body: {},
    //   asResponse: true, // returns a response object instead of data
    // })
    // console.log('sendTwoFactorOTP response', response2)
    console.log(
      'signInEmail response.twoFactorRedirect ',
      //@
      //@ts-expect-error twoFactorRedirect
      response.twoFactorRedirect
    )
    console.log('signInEmail response', response)
    //@ts-expect-error twoFactorRedirect
    if (response.twoFactorRedirect) {
      redirect('/verify-request/totp')
    }

    // if (!response.ok && response.status !== 302) {
    //   return {
    //     success: false,
    //     message: 'Identifiants invalides',
    //   }
    // }
    redirect('/dashboard')
    //4. redirection definie dans la configuration
    //redirect(response.headers.get('Location') ?? '/404')
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    //@ts-expect-error headers
    if (error.headers) {
      //@ts-expect-error headers
      console.log('error', error.headers)
      //@ts-expect-error headers
      redirect(error.headers.get('Location') ?? '/404')
    }
    console.log('error', error)
    return {
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
    }
  }
}

export async function loginMagicLinkAction(
  prevState: MagicLinkFormState,
  formData: FormData
): Promise<MagicLinkFormState> {
  try {
    // 1. Validation Server Zod des données du formulaire
    const validationResult = authMagicLinkFormSchema.safeParse({
      email: formData.get('email'),
    })

    if (!validationResult.success) {
      const validationErrors: MagicLinkValidationError[] =
        validationResult.error.errors.map((err) => ({
          field: err.path[0] as keyof typeof authMagicLinkFormSchema._type,
          message: err.message,
        }))
      return {
        success: false,
        message: 'Erreur de validation',
        errors: validationErrors,
      }
    }

    const {email} = validationResult.data

    // 2. Vérification de l'existence de l'utilisateur (optionnel)
    const user = await getUserByEmailService(email)
    if (!user) {
      return {
        success: false,
        message: 'Aucun compte trouvé avec cet email',
      }
    }

    // 3. Envoi du magic link avec better auth
    const response = await auth.api.signInMagicLink({
      headers: await headers(),
      body: {
        email,
        callbackURL: '/dashboard',
      },
    })
    console.log('response', response)

    if (!response.status) {
      return {
        success: false,
        message: "Erreur lors de l'envoi du magic link",
      }
    }

    redirect('/verify-request')
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi du magic link",
    }
  }
}

/**
 * Action d'inscription d'un nouvel utilisateur
 */
export async function registerCredentialAction(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  // 1. Validation server  Zod des données du formulaire
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

  const {name, email, password} = validationResult.data

  // 2. Vérifier si l'email est disponible
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

  // 3. creation de l'utilisateur avec better auth
  const response = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password: password ?? '',
    },
    asResponse: true,
  })

  if (!response.ok && response.status !== 302) {
    return {
      success: false,
      message: "Erreur lors de la création de l'utilisateur",
    }
  }

  // 4. Créer son organisation dans la base de données
  try {
    const userOrganization = await createOrganizationForUserService(email)
    console.log('userOrganization', userOrganization)
    // await auth.api.setActiveOrganization({
    //   headers: response2.headers,
    //   body: {
    //     organizationId: userOrganization.organizationId,
    //   },
    // })

    if (!requireEmailVerification) {
      const response = await auth.api.signInEmail({
        headers: await headers(),
        body: {
          email,
          password,
          rememberMe: true,
        },
        asResponse: true,
      })

      if (!response.ok && response.status !== 302) {
        return {
          success: false,
          message: 'Identifiants invalides',
        }
      }
      redirect(response.headers.get('Location') ?? '/404')
    }

    redirect('/verify-request')
  } catch (error) {
    console.log('error', error)
    if (isRedirectError(error)) {
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
 * Action d'inscription d'un nouvel utilisateur
 */
export async function registerMagicLinkAction(
  prevState: MagicLinkFormState,
  formData: FormData
): Promise<MagicLinkFormState> {
  // 1. Validation server  Zod des données du formulaire
  const validationResult = authMagicLinkFormSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validationResult.success) {
    const validationErrors: MagicLinkValidationError[] =
      validationResult.error.errors.map((err) => ({
        field: err.path[0] as keyof typeof authMagicLinkFormSchema._type,
        message: err.message,
      }))
    return {
      success: false,
      message: 'Erreur de validation',
      errors: validationErrors,
    }
  }

  const {email} = validationResult.data

  // 2. Vérifier si l'email est disponible
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
  // 3. Envoi du magic link avec better auth
  const response = await auth.api.signInMagicLink({
    headers: await headers(),
    body: {
      email,
      callbackURL: '/dashboard',
    },
  })

  if (!response.status) {
    return {
      success: false,
      message: "Erreur lors de l'envoi du magic link",
    }
  }

  // 4. Créer son organisation dans la base de données
  try {
    redirect('/verify-request')
  } catch (error) {
    console.log('error', error)
    if (isRedirectError(error)) {
      throw error
    }
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi du magic link",
    }
  }
  return {
    success: true,
    message: 'Un lien de connexion a été envoyé à votre adresse email',
  }
}

/**
 * Action pour l'inscription avec un provider OAuth (Google, Apple)
 */
export async function registerProviderAction(
  provider: 'google' | 'apple'
): Promise<LoginFormState> {
  console.log('registerProviderAction appelé', provider)
  return {
    success: true,
    message: 'Redirection vers le provider...',
  }
  // try {
  //   // Rediriger vers la page de connexion du provider
  //   await signIn(provider, {
  //     callbackUrl: '/dashboard',
  //     redirect: false,
  //   })

  //   return {
  //     success: true,
  //     message: 'Redirection vers le provider...',
  //   }
  // } catch (error) {
  //   if (isRedirectError(error)) {
  //     throw error
  //   }

  //   console.error('Erreur lors de la connexion avec le provider:', error)

  //   return {
  //     success: false,
  //     message:
  //       error instanceof Error
  //         ? error.message
  //         : 'Une erreur est survenue lors de la connexion avec le provider',
  //     errors: [
  //       {
  //         field: 'email',
  //         message:
  //           error instanceof Error
  //             ? error.message
  //             : 'Une erreur est survenue lors de la connexion avec le provider',
  //       },
  //     ],
  //   }
  // }
}

export async function logoutAction() {
  //await auth.api.signOut()
}
