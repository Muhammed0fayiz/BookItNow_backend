
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ChatRoomDocument extends Document {
  participants: Types.ObjectId[];
  online: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema: Schema<ChatRoomDocument> = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, required: true }],
    online: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true }
);

export const ChatRoomModel = mongoose.model<ChatRoomDocument>('ChatRoom', ChatRoomSchema);
