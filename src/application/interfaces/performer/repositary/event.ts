import { TempPerformerDocument } from "../../../../infrastructure/models/tempPerformer";
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import { asPerformer } from "../../../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { performerDocument } from "../../../../domain/entities/performer";
import { EventDocument } from "../../../../infrastructure/models/eventsModel";
import { UpcomingEventDocument } from "../../../../domain/entities/upcomingevent";
import { BookingDocument } from "../../../../infrastructure/models/bookingEvents";
import { SlotDocuments } from "../../../../infrastructure/models/slotModel";
import { SlotMangement } from "../../../../domain/entities/slot";
import { performerAllDetails } from "../../../../domain/entities/performerAllDetails";
import { PerformerReport } from "../../../../domain/entities/performerReport";

export interface IperformerEventRepository {
  getEvent(eventId: mongoose.Types.ObjectId):Promise<EventDocument|null>
  uploadedEvents(event: {
    imageUrl: any;
    title: any;
    category: any;
    userId: any;
    price: any;
    teamLeader: any;
    teamLeaderNumber: any;
    description: any;
  }): Promise<EventDocument | null | string>;
  getPerformerEvents(id: string): Promise<EventDocument[] | null>;
  deleteEvent(id: string): Promise<EventDocument | null>;
  editEvents(
    eventId: string,
    event: {
      imageUrl?: string; 
      title: string;
      category: string;
      userId: Types.ObjectId;
      price: number;
      teamLeader: string;
      teamLeaderNumber: number;
      description: string;
    }
  ): Promise<EventDocument | null | string>;
  toggleBlockStatus(id: string): Promise<EventDocument | null>;
  getAllUpcomingEvents(
    id: mongoose.Types.ObjectId
  ): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  cancelEvent(id: mongoose.Types.ObjectId): Promise<BookingDocument | null>;


    getAlleventHistory(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[] }>;
  changeEventStatus(): Promise<BookingDocument[] | null>;
  getUpcomingEvents(
    performerId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]>;

  
}
