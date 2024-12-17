import mongoose, { Schema, Document, Types } from 'mongoose';

export interface PerformerDocuments extends Document {
  userId: Types.ObjectId;
  bandName: string;
  mobileNumber: string;
  rating: number;
  description: string;
  profileImage?: string;
  totalReviews: number;
  walletBalance?: number;
  place?:string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PerformerSchema: Schema<PerformerDocuments> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bandName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  rating: { type: Number, required: true, default: 0 },
  description: { type: String, required: true },
  profileImage: { type: String, default: 'http://i.pravatar.cc/250?img=58' },
  totalReviews: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  place:{type:String,default:'India'}
}, { timestamps: true});

export const PerformerModel = mongoose.model<PerformerDocuments>('Performer', PerformerSchema);
