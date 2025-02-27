export const GRANTED_ERROR_MESSAGE = 'Accès refusé'

export class GrantedError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'GrantedError'
    this.message = message ?? GRANTED_ERROR_MESSAGE

    // This is needed to preserve the stack trace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, GrantedError)
    }
  }
}
