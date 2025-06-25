import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.colorize(),
        winston.format.printf(({timestamp, level, message, ...metadata}) => {
          // console.log('🔧 [LOGGER] metadata', metadata)

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
