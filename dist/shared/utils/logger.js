"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
}));
const rotateTransport = new winston_daily_rotate_file_1.default({
    filename: path_1.default.join("logs", "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    frequency: "7d",
    maxFiles: "30d",
    level: "info",
});
const logger = (0, winston_1.createLogger)({
    level: "info",
    format: logFormat,
    transports: [
        new winston_1.transports.Console(),
        rotateTransport,
    ],
});
exports.default = logger;
