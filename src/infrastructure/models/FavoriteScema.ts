import mongoose, { Schema, Document, Types } from 'mongoose';

export interface FavoriteDocument extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema: Schema<FavoriteDocument> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const FavoriteModel = mongoose.model<FavoriteDocument>('Favorite', FavoriteSchema);
    