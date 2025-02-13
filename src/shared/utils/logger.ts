import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";


const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);


const rotateTransport = new DailyRotateFile({
  filename: path.join("logs", "app-%DATE%.log"), 
  datePattern: "YYYY-MM-DD", 
  frequency: "7d",
  maxFiles: "30d", 
  level: "info", 
});


const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.Console(), 
    rotateTransport, 
  ],
});

export default logger;
