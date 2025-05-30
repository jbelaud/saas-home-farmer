'use server'

import {isRedirectError} from 'next/dist/client/components/redirect-error'
import {redirect} from 'next/navigation'
import {AuthError} from 'next-auth'

import {
  authLoginFormSchema,
  authRegisterFormSchema,
} from '@/components/features/auth/auth-form-validation'
import {signIn, signOut} from '@/lib/auth'
import {
  createUserService,
  getUserByEmailService,
} from '@/services/facades/user-service-facade'

type LoginResult = {
  success: boolean
  message: string
} | null
/**
 * Action de login utilisant NextAuth
 */
export async function loginAction(prevState: LoginResult, formData: FormData) {
  console.log('login appelé')
  try {
    // Validation Zod des données du formulaire
    const validationResult = authLoginFormSchema.safeParse({
      email: formData.get('email'),
    })

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((err) => err.message)
        .join(', ')
      return {
        success: false,
        message: errors,
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
        }
      }

      console.log('Utilisateur trouvé:', user.email)
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error)
      return {
        success: false,
        message: "Une erreur est survenue lors de la vérification de l'email",
      }
    }

    console.log(' avant signIn', email)
    // Utilisation de l'API de signIn côté serveur
    // await signIn('credentials', {
    //   email,
    //   password,
    //   redirect: false,
    // })
    await signIn('resend', {
      email,
      redirect: false,
    })
    console.log(' après signIn')
    // Si tout se passe bien, rediriger vers le tableau de bord
    redirect('/verify-request')
  } catch (error) {
    //https://github.com/nextauthjs/next-auth/discussions/9389#discussioncomment-8046451
    if (isRedirectError(error)) {
      throw error
    }
    console.log(' erreur', error)
    // Gérer les erreurs d'authentification
    if (error instanceof AuthError) {
      return {
        success: false,
        message: 'Identifiants invalides',
      }
    }

    // Gérer les autres erreurs
    return {
      success: false,
      message: 'Une erreur est survenue lors de la connexion',
    }
  }
}

/**
 * Action d'inscription d'un nouvel utilisateur
 */
export async function registerAction(
  prevState: LoginResult,
  formData: FormData
) {
  try {
    // Validation Zod des données du formulaire
    const validationResult = authRegisterFormSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((err) => err.message)
        .join(', ')
      return {
        success: false,
        message: errors,
      }
    }

    const {name, email, password} = validationResult.data

    // Créer l'utilisateur dans la base de données
    try {
      const user = await createUserService({
        name,
        email,
        password,
      })

      await signIn('resend', {
        email: user.email,
        password: user.password, //not used with Resend
        redirect: false,
      })

      console.log('Utilisateur créé:', user)

      redirect('/verify-request')
    } catch (error) {
      if (isRedirectError(error)) {
        console.log('Erreur de redirection:', error)
        throw error
      }
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue lors de la création du compte',
      }
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    console.log("Erreur d'inscription:", error)

    return {
      success: false,
      message: "Une erreur est survenue lors de l'inscription",
    }
  }
}

export async function logoutAction() {
  await signOut()
}
