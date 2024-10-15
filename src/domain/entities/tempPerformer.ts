import mongoose, { Document, Types } from 'mongoose';

// Define the TempPerformer class
export class TempPerformer {
    constructor(
        public readonly bandName: string,
        public readonly place: string,
        public readonly videoUrl: string,
        public readonly category: string,
        public readonly description: string,
        public readonly user_id: Types.ObjectId, // Reference to the User model
        public readonly _id?: string // Optional, as it may not be available at the time of object creation
    ) {}
}

// Update TempPerformerDocument interface
export interface TempPerformerDocument extends Document {
    bandName: string;
    place: string;
    videoUrl: string;
    category: string;
    description: string;
    user_id: Types.ObjectId;
    createdAt?: Date;
}
