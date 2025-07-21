import {logger} from '@/lib/logger'
import {AuthorizationError} from '@/services/errors/authorization-error'

import * as postServiceMethods from '../../post-service'

// Définition d'un type générique pour les méthodes de service
type ServiceMethods = typeof postServiceMethods

// Créer un Proxy flexible pour intercepter toutes les fonctions
const postServiceInterceptor = new Proxy(postServiceMethods, {
  get(target: ServiceMethods, property: keyof ServiceMethods) {
    const originalMethod = target[property] as unknown

    // Vérifier que la propriété est bien une fonction
    if (typeof originalMethod === 'function') {
      // Retourner une nouvelle fonction qui intercepte les appels
      return async function (...args: unknown[]) {
        logger.info(`[POST-SERVICE] Appel de la méthode ${String(property)}`)
        logger.debug(
          `[POST-SERVICE] Appel de la méthode ${String(property)} avec les arguments `,
          {args}
        )
        try {
          // Appel de la méthode originale
          const result = await originalMethod.apply(target, args)

          logger.info(`[POST-SERVICE] Retour de la méthode ${String(property)}`)
          logger.debug(
            `[POST-SERVICE] Résultat de la méthode ${String(property)} `,
            result
          )
          return result
        } catch (error) {
          if (error instanceof AuthorizationError) {
            logger.error(
              `[POST-SERVICE] Autorisation Erreur dans la méthode ${String(property)} :`,
              (error as Error).message
            )
          } else {
            logger.error(
              `[POST-SERVICE] Erreur dans la méthode ${String(property)} :`,
              error
            )
            logger.debug(
              `[POST-SERVICE] Erreur dans la méthode ${String(property)} : ${(error as Error).message}`,
              error
            )
          }
          // Re-lancer l'erreur pour que l'appelant puisse la gérer
          throw error
        }
      }
    } else {
      // Retourner la propriété telle quelle si ce n'est pas une fonction
      return originalMethod
    }
  },
})

export default postServiceInterceptor
