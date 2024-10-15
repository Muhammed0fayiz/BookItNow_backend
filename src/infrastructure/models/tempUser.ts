import mongoose, { Schema, Document } from 'mongoose';

// Define the structure of the OTP document.
export interface OtpDocument extends Document {
  otp: number;        // The OTP number
  email: string;     // The user's email
  username: string;  // The user's username
  password: string;  // The user's password
  createdAt: Date;   // Timestamp of when the OTP was created
}

// Create the OTP schema.
const OtpSchema: Schema<OtpDocument> = new Schema({
  otp: { type: Number, required: true },           // Required OTP field
  email: { type: String, required: true },         // Required email field
  username: { type: String, required: true },      // Required username field
  password: { type: String, required: true },      // Required password field
  createdAt: { type: Date, default: Date.now, expires: '15m' } // Automatically deletes after 15 minutes
});

// Export the OTP model.
export const tempUserModel = mongoose.model<OtpDocument>('tempUser', OtpSchema);
