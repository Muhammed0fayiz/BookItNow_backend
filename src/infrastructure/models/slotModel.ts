import mongoose, { Schema, Document, Types } from 'mongoose';

export interface SlotDocuments extends Document {
  performerId: Types.ObjectId;
  dates: Date[];
  // No need for `isAvailable` since it's removed in the previous change
}

const SlotSchema: Schema<SlotDocuments> = new Schema({
  performerId: { type: Schema.Types.ObjectId, ref: 'Performer', required: true },
  dates: { type: [Date], required: true },
}, { timestamps: true });

export const SlotModel = mongoose.model<SlotDocuments>('Slot', SlotSchema);
