import mongoose, { Schema, Document, Types } from 'mongoose';

export interface EventDocument extends Document {
  title: string;
  category: string;
  userId: Types.ObjectId;
  price: number;
  status: string;
  teamLeader: string;
  teamLeaderNumber: string;
  rating: number;
  totalReviews: number;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  isblocked: boolean;
  blockingReason: string;
  isperformerblockedevents: boolean;
  blockingPeriod: Date | null;
}

const EventSchema: Schema<EventDocument> = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true, default: "active" },
    teamLeader: { type: String, required: true },
    teamLeaderNumber: { type: String, required: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isblocked: { type: Boolean, default: false },
    isperformerblockedevents: { type: Boolean, default: false },
    blockingReason: { type: String, default: "" }, 
    blockingPeriod: { type: Date, default: null },
  },
  { timestamps: true }
);

export const EventModel = mongoose.model<EventDocument>("Event", EventSchema);
