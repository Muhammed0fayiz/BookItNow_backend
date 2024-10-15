import mongoose, { Document, Types } from "mongoose"; // Import mongoose and Document

// Define the User class
export class Performer {
  static findById(id: string) {
    throw new Error("Method not implemented.");
  }
  constructor(
    public readonly userId: Types.ObjectId,
    public readonly bandName: string,
    public readonly place: string,
    public readonly rating: number,
    public readonly description: string
  ) {}
}

// Reference to the User model

// Update UserDocument interface
export interface performerDocument extends Document {
  userId: Types.ObjectId;
  bandName: string;
  place: string;
  rating: number;
  description: string; // Change to string or keep as mongoose.Types.ObjectId if required
}
