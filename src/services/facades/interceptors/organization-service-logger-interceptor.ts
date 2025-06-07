import {logger} from '@/lib/logger'
import {AuthorizationError} from '@/services/errors/authorization-error'

import * as organizationServiceMethods from '../../organization-service'

// Définition d'un type générique pour les méthodes de service
type ServiceMethods = typeof organizationServiceMethods

// Créer un Proxy flexible pour intercepter toutes les fonctions
const organizationServiceInterceptor = new Proxy(organizationServiceMethods, {
  get(target: ServiceMethods, property: keyof ServiceMethods) {
    const originalMethod = target[property] as unknown

    // Vérifier que la propriété est bien une fonction
    if (typeof originalMethod === 'function') {
      // Retourner une nouvelle fonction qui intercepte les appels
      return async function (...args: unknown[]) {
        logger.info(
          `[ORGANIZATION-SERVICE] Appel de la méthode ${String(property)}`
        )
        logger.debug(
          `[ORGANIZATION-SERVICE] Appel de la méthode ${String(property)} avec les arguments `,
          {args}
        )
        try {
          // Appel de la méthode originale
          const result = await originalMethod.apply(target, args)

          logger.info(
            `[ORGANIZATION-SERVICE] Retour de la méthode ${String(property)}`
          )
          logger.debug(
            `[ORGANIZATION-SERVICE] Résultat de la méthode ${String(property)} `,
            result
          )
          return result
        } catch (error) {
          if (error instanceof AuthorizationError) {
            logger.error(
              `[ORGANIZATION-SERVICE] Authorisation Erreur dans la méthode ${String(property)} :`,
              (error as Error).message
            )
          } else {
            logger.error(
              `[ORGANIZATION-SERVICE] Erreur dans la méthode ${String(property)} :`,
              error
            )
            logger.debug(
              `[ORGANIZATION-SERVICE] Erreur dans la méthode ${String(property)} : ${(error as Error).message}`,
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

export default organizationServiceInterceptor
