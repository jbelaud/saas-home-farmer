'use server'

import {signIn, signOut} from '@/lib/auth'
import {
  createUserService,
  getUserByEmailService,
} from '@/services/facades/user-service-facade'
import {AuthError} from 'next-auth'
import {isRedirectError} from 'next/dist/client/components/redirect-error'
import {redirect} from 'next/navigation'

type LoginResult = {
  success: boolean
  message: string
} | null
/**
 * Action de login utilisant NextAuth
 */
export async function login(prevState: LoginResult, formData: FormData) {
  console.log('login appelé')
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email) {
      return {
        success: false,
        message: 'Email et mot de passe requis',
      }
    }

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
      password, //not user with Resend
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
export async function register(prevState: LoginResult, formData: FormData) {
  console.log('register appelé')
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation basique
    if (!name || !email || !password) {
      return {
        success: false,
        message: 'Tous les champs sont requis',
      }
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Les mots de passe ne correspondent pas',
      }
    }

    // Créer l'utilisateur dans la base de données
    try {
      console.log("Création de l'utilisateur...")
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

export async function logout() {
  await signOut()
}
