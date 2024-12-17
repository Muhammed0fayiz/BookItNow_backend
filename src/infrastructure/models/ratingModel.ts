import mongoose, { Schema, Document, Types } from 'mongoose';

export interface RatingDocument extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema<RatingDocument> = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: false },
}, { timestamps: true });

export const RatingModel = mongoose.model<RatingDocument>('Rating', RatingSchema);
