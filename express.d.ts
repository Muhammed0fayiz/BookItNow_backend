import { Server as SocketIOServer } from "socket.io";
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      io: SocketIOServer;
    }
  }
}