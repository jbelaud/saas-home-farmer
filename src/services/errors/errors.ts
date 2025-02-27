export class AuthorizationError extends Error {
  constructor(message: string = 'Accès non autorisé.') {
    super(message)
    this.name = 'AuthorizationError'
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AuthorizationError)
    }
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Ressource introuvable.') {
    super(message)
    this.name = 'NotFoundError'
  }
}
