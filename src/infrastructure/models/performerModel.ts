import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for Performer document
export interface PerformerDocuments extends Document {
  userId: Types.ObjectId;  // Reference to the User model
  bandName: string;
  mobileNumber:string;
  rating: number;
  description: string;
  profileImage?: string;
  totalReviews?:number;
  walletBalance?:number;
}

// Performer schema definition
const PerformerSchema: Schema<PerformerDocuments> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Refers to the 'User' model
  bandName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },  // Default rating is 0
  description: { type: String, required: true },
  profileImage: { type: String, default: 'http://i.pravatar.cc/250?img=58' },
  totalReviews:{type:String,default:0},
  walletBalance:{type:String,default:0}
}, { timestamps: false });  // Disable both createdAt and updatedAt

// Create and export Performer model
export const PerformerModel = mongoose.model<PerformerDocuments>('Performer', PerformerSchema);
