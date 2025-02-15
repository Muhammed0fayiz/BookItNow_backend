import { Types } from "mongoose";

export interface Messages {
  _id: Types.ObjectId;
  roomId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  read: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  role?: "sender" | "receiver"; // Optional because it’s added later
}


