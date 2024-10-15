import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocuments extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  isblocked: boolean;
  isPerformerBlocked: boolean;
  waitingPermission: boolean;
  // role: 'user' | 'performer' | 'admin';  
  createdAt?: Date; 
  updatedAt?: Date; 
  profileImage?: string;
}

const UserSchema: Schema<UserDocuments> = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isblocked: { type: Boolean, default: false },
  isPerformerBlocked: { type: Boolean, default: false },
  waitingPermission: { type: Boolean, default: false },
  // role: { type: String, enum: ['user', 'performer', 'admin'], default: 'user' },  // New field for role
  profileImage: { type: String, default: 'http://i.pravatar.cc/250?img=58' },
}, { timestamps: true });

export const UserModel = mongoose.model<UserDocuments>('User', UserSchema);