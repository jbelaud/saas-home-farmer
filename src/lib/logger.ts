import winston from 'winston'

import {env} from '@/env'
const isConsole = env.NODE_ENV === 'development' ? false : false

// Logger Winston pour la production
const winstonLogger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.colorize(),
        winston.format.printf(({timestamp, level, message, ...metadata}) => {
          // Récupérer les arguments supplémentaires depuis Symbol(splat)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const splatArgs = (metadata as any)[Symbol.for('splat')] || []

          // Récupérer les autres métadonnées (hors symbols)
          const otherMetadata = Object.keys(metadata)
            .filter((key) => !key.startsWith('Symbol('))
            .reduce(
              (acc, key) => {
                acc[key] = metadata[key]
                return acc
              },
              {} as Record<string, unknown>
            )

          // Si on a des métadonnées structurées, on les privilégie
          // Sinon on utilise les arguments du splat
          let formattedData = ''

          if (Object.keys(otherMetadata).length > 0) {
            // On a des métadonnées structurées, on les affiche
            formattedData = ` | ${JSON.stringify(otherMetadata)}`
          } else if (Array.isArray(splatArgs) && splatArgs.length > 0) {
            // On a seulement des arguments dans splat, on les affiche
            formattedData = ` : ${splatArgs
              .map((arg: unknown) =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              )
              .join(' ')}`
          }

          return ` ${timestamp} [${level}]: ${message}${formattedData}`
        })
      ),
    }),
    // new winston.transports.File({
    //   filename: logFile,
    //   level: 'info',
    //   format: createFileFormat(),
    // }),
    // new winston.transports.File({
    //   filename: logErrorFile,
    //   level: 'error',
    //   format: createFileFormat(),
    // }),

    // new winston.transports.File({
    //   filename: logDebugFile,
    //   level: 'debug',
    //   format: createFileFormat(),
    // }),
  ],
})

// Wrapper pour console.log en développement (meilleur formatage)
const consoleLogger = {
  error: (message: string, ...args: unknown[]) => {
    console.error('❌', message, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn('⚠️', message, ...args)
  },
  info: (message: string, ...args: unknown[]) => {
    console.info('ℹ️', message, ...args)
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug('🐛', message, ...args)
  },
  log: (message: string, ...args: unknown[]) => {
    console.log('📝', message, ...args)
  },
}
// Exporter le logger approprié selon l'environnement
export const logger = isConsole ? consoleLogger : winstonLogger
