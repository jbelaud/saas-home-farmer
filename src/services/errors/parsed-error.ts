export const PARSED_ERROR_MESSAGE = 'Erreur de validation'
export class ParsedError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'ParsedError'
    this.message = PARSED_ERROR_MESSAGE

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ParsedError)
    }
  }
}
