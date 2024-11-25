import mongoose, { Schema, Document } from 'mongoose';

export interface WalletDocument extends Document {
  userId: Schema.Types.ObjectId; // Reference to the User model
  amount: number;
  transactionType: 'debit' | 'credit';
  role: 'user' | 'performer';
  date: Date;
  description: string;
}

const WalletSchema: Schema<WalletDocument> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['debit', 'credit'], required: true },
  role: { type: String, enum: ['user', 'performer'], required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, default: 'no' }, // Corrected the type casing
});

export const WalletModel = mongoose.model<WalletDocument>('Wallet', WalletSchema);
