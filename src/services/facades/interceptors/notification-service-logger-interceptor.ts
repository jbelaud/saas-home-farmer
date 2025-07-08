import {logger} from '@/lib/logger'
import {AuthorizationError} from '@/services/errors/authorization-error'

import * as notificationServiceMethods from '../../notification-service'

// Définition d'un type générique pour les méthodes de service
type ServiceMethods = typeof notificationServiceMethods

// Créer un Proxy flexible pour intercepter toutes les fonctions
const notificationServiceInterceptor = new Proxy(notificationServiceMethods, {
  get(target: ServiceMethods, property: keyof ServiceMethods) {
    const originalMethod = target[property] as unknown

    // Vérifier que la propriété est bien une fonction
    if (typeof originalMethod === 'function') {
      // Retourner une nouvelle fonction qui intercepte les appels
      return async function (...args: unknown[]) {
        logger.info(
          `[NOTIFICATION-SERVICE] Appel de la méthode ${String(property)}`
        )
        logger.debug(
          `[NOTIFICATION-SERVICE] Appel de la méthode ${String(property)} avec les arguments `,
          {args}
        )
        try {
          // Appel de la méthode originale
          const result = await originalMethod.apply(target, args)

          logger.info(
            `[NOTIFICATION-SERVICE] Retour de la méthode ${String(property)}`
          )
          logger.debug(
            `[NOTIFICATION-SERVICE] Résultat de la méthode ${String(property)} `,
            result
          )
          return result
        } catch (error) {
          if (error instanceof AuthorizationError) {
            logger.error(
              `[NOTIFICATION-SERVICE] Authorisation Erreur dans la méthode ${String(property)} :`,
              (error as Error).message
            )
          } else {
            logger.error(
              `[NOTIFICATION-SERVICE] Erreur dans la méthode ${String(property)} :`,
              error
            )
            logger.debug(
              `[NOTIFICATION-SERVICE] Erreur dans la méthode ${String(property)} : ${(error as Error).message}`,
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

export default notificationServiceInterceptor
