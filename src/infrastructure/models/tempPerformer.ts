import mongoose, { Schema, Document, Types } from 'mongoose';

export interface TempPerformerDocument extends Document {
  bandName: string;
  place: string;
  videoUrl: string;
  category: string;
  description: string;
  user_id: Types.ObjectId;
  createdAt?: Date;
}

const TempPerformerSchema: Schema<TempPerformerDocument> = new Schema({
  bandName: { type: String, required: true },
  place: { type: String, required: true },
  videoUrl: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const TempPerformerModel = mongoose.model<TempPerformerDocument>('TempPerformer', TempPerformerSchema);
