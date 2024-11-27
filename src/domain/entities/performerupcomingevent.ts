import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for Upcoming Events
export interface UpcomingEventDocument extends Document {
  // Event Related Fields
  title: string;
  category: string;
  userId: Types.ObjectId;
  performerId: Types.ObjectId;
  price: number;
  status: string;
  teamLeader: string;
  teamLeaderNumber: string;
  rating: number;
  description: string;
  imageUrl: string;
  isblocked: boolean;
  username:string
  // Booking Related Fields
  advancePayment: number;
  restPayment: number;
  time: string;
  place: string;
  date: Date;
  bookingStatus: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Upcoming Events
const UpcomingEventSchema: Schema<UpcomingEventDocument> = new Schema({
  // Event Related Fields
  title: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  performerId: { type: Schema.Types.ObjectId, ref: 'Performer', required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, default: 'active' },
  teamLeader: { type: String, required: true },
  teamLeaderNumber: { type: String, required: true },
  rating: { type: Number, default: 0 },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isblocked: { type: Boolean, default: false },
  username:{ type: String, required: true },
  // Booking Related Fields
  advancePayment: { type: Number, required: true },
  restPayment: { type: Number, required: true },
  time: { type: String, required: true },
  place: { type: String, required: true },
  date: { type: Date, required: true },
  bookingStatus: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
}, { timestamps: true });

// Create indexes for better query performance
UpcomingEventSchema.index({ date: 1 });
UpcomingEventSchema.index({ performerId: 1 });
UpcomingEventSchema.index({ userId: 1 });

// Create the model
export const UpcomingEventModel = mongoose.model<UpcomingEventDocument>('UpcomingEvent', UpcomingEventSchema);

// Class representation (optional, for better type safety)
export class UpcomingEvent {
  constructor(
    public readonly title: string,
    public readonly category: string,
    public readonly userId: Types.ObjectId,
    public readonly performerId: Types.ObjectId,
    public readonly price: number,
    public readonly status: string,
    public readonly teamLeader: string,
    public readonly teamLeaderNumber: string,
    public readonly rating: number,
    public readonly description: string,
    public readonly imageUrl: string,
    public readonly advancePayment: number,
    public readonly restPayment: number,
    public readonly time: string,
    public readonly place: string,
    public readonly date: Date,
    public readonly bookingStatus: string,
    public readonly isblocked: boolean = false,
    public readonly _id?: string
  ) {}
}