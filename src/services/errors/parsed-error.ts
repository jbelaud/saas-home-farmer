import {ZodError} from 'zod'

export const PARSED_ERROR_MESSAGE = 'Erreur de validation'
export class ParsedError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'ParsedError'
    // this.message = PARSED_ERROR_MESSAGE

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ParsedError)
    }
  }
}

export class ParsedZodError extends Error {
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
      Error.captureStackTrace(this, ParsedError)
    }
    return this
  }
}
