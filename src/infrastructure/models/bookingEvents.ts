import mongoose, { Schema, Document, Types } from 'mongoose';

export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  performerId: Types.ObjectId;
  userId: Types.ObjectId;
  price: number;
  advancePayment: number;
  restPayment: number;
  time: string;
  place: string;
  date: Date;
  bookingStatus: string; // New field for booking status
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema<BookingDocument> = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  performerId: { type: Schema.Types.ObjectId, ref: 'Performer', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  advancePayment: { type: Number, required: true },
  restPayment: { type: Number, required: true },
  time: { type: String, required: true },
  place: { type: String, required: true },
  date: { type: Date, required: true },
  bookingStatus: { type: String, default: "booking", required: true } 
}, { timestamps: true });

export const BookingModel = mongoose.model<BookingDocument>('Booking', BookingSchema);
