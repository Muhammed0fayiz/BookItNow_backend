import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for Performer document
export interface PerformerDocuments extends Document {
  userId: Types.ObjectId;  // Reference to the User model
  bandName: string;
  place: string;
  rating: number;
  description: string;
}

// Performer schema definition
const PerformerSchema: Schema<PerformerDocuments> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Refers to the 'User' model
  bandName: { type: String, required: true },
  place: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },  // Default rating is 0
  description: { type: String, required: true }
}, { timestamps: false });  // Disable both createdAt and updatedAt

// Create and export Performer model
export const PerformerModel = mongoose.model<PerformerDocuments>('Performer', PerformerSchema);
