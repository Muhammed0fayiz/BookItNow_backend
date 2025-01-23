import { UpcomingEventDocument } from "../../../../domain/entities/upcomingevent";
import { TempPerformerDocument } from "../../../../infrastructure/models/tempPerformer";
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../../../infrastructure/models/eventsModel";
import { Performer } from "../../../../domain/entities/performer";
import { BookingDocument } from "../../../../infrastructure/models/bookingEvents";
import { WalletDocument } from "../../../../infrastructure/models/walletHistory";
import { SlotDocuments } from "../../../../infrastructure/models/slotModel";
import { FavoriteDocument } from "../../../../infrastructure/models/FavoriteScema";
import { ChatRoomDocument } from "../../../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../../domain/entities/chatRoom";
import { Reminder } from "../../../../domain/entities/reminder";
import { MessageNotification } from "../../../../domain/entities/messageNotification";
import { eventRating } from "../../../../domain/entities/eventRating";


export interface IuserEventRepository {

  

 

 
  getAllEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>;
  userBookEvent(
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;
  getAllUpcomingEvents(
    id: mongoose.Types.ObjectId
  ): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  cancelEvent(
    objectId: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null>;
  getAllEventHistory(id: mongoose.Types.ObjectId): Promise<{
    totalCount: number;
    pastEventHistory: UpcomingEventDocument[];
  }>;
  getEventHistory(
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<{
    pastEventHistory: UpcomingEventDocument[];
  }>;
  getFilteredEvents(
    id:mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ events: EventDocument[]; totalCount: number } | null>;
  ratingAdded(
    bookingId: mongoose.Types.ObjectId,
    rating: number,
    review: string
  ): Promise<EventDocument | null>;
    getEventRating(eventId:mongoose.Types.ObjectId):Promise<eventRating[]|null>
  userWalletBookEvent(
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;
  toggleFavoriteEvent(
    uid: mongoose.Types.ObjectId,
    eid: mongoose.Types.ObjectId
  ): Promise<FavoriteDocument | null>;
  getFilteredPerformers(
 id:mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ performers: Performer[]; totalCount: number } | null>;
favaroiteEvents(id: mongoose.Types.ObjectId): Promise<{ totalEvent: number; events: EventDocument[] | null }>;
getUpcomingEvents(
  userId: mongoose.Types.ObjectId,
  page: number
): Promise<UpcomingEventDocument[]>;



  getAllPerformer(id: mongoose.Types.ObjectId): Promise<Performer[] | null>;
  availableDate(
    formData: Record<string, any>,
    eventId: string,
    performerId: string
  ): Promise<boolean>;


 
}
