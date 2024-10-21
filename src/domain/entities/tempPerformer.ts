import mongoose, { Document, Types } from 'mongoose';

// Domain Entity
export class TempPerformer {
    constructor(
        public readonly bandName: string,
        public readonly mobileNumber: string,
        public readonly video: string,
        public readonly description: string,
        public readonly user_id: Types.ObjectId,
        public readonly _id?: string
    ) {}
}

// Document Interface
export interface TempPerformerDocument extends Document {
    bandName: string;
    mobileNumber: string;
    video: string;
    description: string;
    user_id: Types.ObjectId;
    createdAt?: Date;
}

// Schema for infrastructure layer
import { Schema } from 'mongoose';

const TempPerformerSchema = new Schema({
    bandName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    video: { type: String, required: true },
    description: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export const TempPerformerModel = mongoose.model<TempPerformerDocument>('TempPerformer', TempPerformerSchema);