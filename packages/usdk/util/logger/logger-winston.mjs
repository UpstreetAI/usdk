import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { Logger } from './logger-interface.mjs';

class WinstonLogger extends Logger {
  constructor() {
    super();
    const currentDateTime = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);
    const currentModuleDir = fileURLToPath(new URL('.', import.meta.url));
    const logFilePath = path.join(currentModuleDir, `log-${currentDateTime}.log`);

    this.logger = winston.createLogger({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: logFilePath, name: 'error-file', level: 'info'}),
        new winston.transports.Console()
      ]
    });

    console.log('logFilePath: ', logFilePath);
  }

  info(...args) {
    this.logger.info(...args);
  }

  warn(...args) {
    this.logger.warn(...args);
  }

  error(...args) {
    this.logger.error(...args);
  }
}

export default WinstonLogger;