import {ZodError} from 'zod'

export const PARSED_ERROR_MESSAGE = 'Erreur de validation'

export class ValidationError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'ParsedError'
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ValidationError)
    }
  }
}

export class ValidationParsedZodError extends Error {
  constructor(err?: ZodError) {
    const errorDetails = err?.errors
      .map(
        (issue) => `Path: ${issue.path.join('.')} | Message: ${issue.message}`
      )
      .join('\n')
    super()
    this.name = 'ParsedError'
    this.message = errorDetails ?? PARSED_ERROR_MESSAGE

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ValidationError)
    }
    return this
  }
}
