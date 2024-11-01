import mongoose, { Schema, Document, Types } from 'mongoose';

export interface EventDocument extends Document {
  title: string;
  category: string;
  userId: Types.ObjectId;
  price: number;
  status: string;
  teamLeader: string;
  teamLeaderNumber: string;
  rating: number;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema<EventDocument> = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, default: 'active' },
  teamLeader: { type: String, required: true },
  teamLeaderNumber: { type: String, required: true },
  rating: { type: Number, default: 0 },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

export const EventModel = mongoose.model<EventDocument>('Event', EventSchema);