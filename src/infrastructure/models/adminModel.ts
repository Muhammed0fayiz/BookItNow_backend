import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AdminDocument extends Document {
  email: string;
  password: string;
  walletAmount: number;
  transactions: { [key: string]: number }; // Transactions stored as a date-based object with counts
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    walletAmount: {
      type: Number,
      default: 0,
    },
    transactions: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

// Create the Admin model
export const AdminModel: Model<AdminDocument> = mongoose.model<AdminDocument>('Admin', AdminSchema);
