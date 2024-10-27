import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface definition
export interface TempPerformerDocument extends Document {
  bandName: string;
  mobileNumber: string;
  video: string;
  description: string;
  user_id: Types.ObjectId;
  createdAt?: Date;

}

// Schema definition
const TempPerformerSchema: Schema<TempPerformerDocument> = new Schema({
  bandName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  video: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const TempPerformerModel = mongoose.model<TempPerformerDocument>('TempPerformer', TempPerformerSchema);

// Database operation
export const videoUploadDB = async (
  bandName: string,
  mobileNumber: string,
  description: string,
  user_id: mongoose.Types.ObjectId,
  s3Location: string
): Promise<TempPerformerDocument | null> => {
  try {
    const newTempPerformer = new TempPerformerModel({
      bandName,
      mobileNumber,
      video: s3Location,
      description,
      user_id
    });
    
    return await newTempPerformer.save();
  } catch (error) {
    console.error("Error occurred while creating temp performer:", error);
    return null;
  }
};