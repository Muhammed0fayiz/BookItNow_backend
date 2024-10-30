import mongoose, { Schema, Document, Types } from 'mongoose';

export interface EventDocument extends Document {
  id: number;
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
}

const EventSchema: Schema<EventDocument> = new Schema({
  id: { type: Number, required: true, unique: true }, // Ensure each event has a unique ID
  title: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true },
  teamLeader: { type: String, required: true },
  teamLeaderNumber: { type: String, required: true },
  rating: { type: Number, default: 0 }, // Default rating can be set
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { timestamps: true });

export const EventModel = mongoose.model<EventDocument>('Event', EventSchema);
