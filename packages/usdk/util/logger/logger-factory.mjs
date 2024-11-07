import WinstonLogger
 from "./logger-winston.mjs";

class LoggerFactory {
    static getLogger() {
      return new WinstonLogger();
    }
  }

export default LoggerFactory;