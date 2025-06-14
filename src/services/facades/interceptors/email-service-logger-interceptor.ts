import {logger} from '@/lib/logger'
import {AuthorizationError} from '@/services/errors/authorization-error'

import * as emailServiceMethods from '../../email-service'

// Définition d'un type générique pour les méthodes de service
type ServiceMethods = typeof emailServiceMethods

// Créer un Proxy flexible pour intercepter toutes les fonctions
const emailServiceInterceptor = new Proxy(emailServiceMethods, {
  get(target: ServiceMethods, property: keyof ServiceMethods) {
    const originalMethod = target[property] as unknown

    // Vérifier que la propriété est bien une fonction
    if (typeof originalMethod === 'function') {
      // Retourner une nouvelle fonction qui intercepte les appels
      return async function (...args: unknown[]) {
        logger.info(`[EMAIL-SERVICE] Appel de la méthode ${String(property)}`)
        logger.debug(
          `[EMAIL-SERVICE] Appel de la méthode ${String(property)} avec les arguments `,
          {args}
        )
        try {
          // Appel de la méthode originale
          const result = await originalMethod.apply(target, args)

          logger.info(
            `[EMAIL-SERVICE] Retour de la méthode ${String(property)}`
          )
          logger.debug(
            `[EMAIL-SERVICE] Résultat de la méthode ${String(property)} `,
            result
          )
          return result
        } catch (error) {
          if (error instanceof AuthorizationError) {
            logger.error(
              `[EMAIL-SERVICE] Autorisation Erreur dans la méthode ${String(property)} :`,
              (error as Error).message
            )
          } else {
            logger.error(
              `[EMAIL-SERVICE] Erreur dans la méthode ${String(property)} :`,
              error
            )
            logger.debug(
              `[EMAIL-SERVICE] Erreur dans la méthode ${String(property)} : ${(error as Error).message}`,
              error
            )
          }

          throw error
        }
      }
    }

    // Retourner la propriété originale si ce n'est pas une fonction
    return originalMethod
  },
})

export default emailServiceInterceptor
