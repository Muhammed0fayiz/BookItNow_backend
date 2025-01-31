import mongoose, { Schema, Document, Types } from 'mongoose';


export interface MessageDocument extends Document {
  roomId: Types.ObjectId; 
  senderId: Types.ObjectId; 
  receiverId:Types.ObjectId;
  message: string; 
  timestamp: Date; 
  read:boolean;
}

const MessageSchema: Schema<MessageDocument> = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }, // New field to track if the message has been read
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);
