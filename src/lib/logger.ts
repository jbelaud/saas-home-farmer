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
          const formattedMetadata =
            Object.keys(metadata).length > 0
              ? ` | ${JSON.stringify(metadata)}`
              : ''
          return ` ${timestamp} [${level}]: ${message} ${formattedMetadata}`
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
