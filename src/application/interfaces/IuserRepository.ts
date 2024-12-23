import { UpcomingEventDocument } from "./../../domain/entities/upcomingevent";
import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { Performer } from "../../domain/entities/performer";
import { BookingDocument } from "../../infrastructure/models/bookingEvents";
import { WalletDocument } from "../../infrastructure/models/walletHistory";
import { SlotDocuments } from "../../infrastructure/models/slotModel";
import { FavoriteDocument } from "../../infrastructure/models/FavoriteScema";
import { ChatRoomDocument } from "../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../infrastructure/models/messageModel";
import { ChatRoom } from "../../domain/entities/chatRoom";

export interface IuserRepository {
  userExist(email: string): Promise<User | null>;
  insertUser(
    mail: string,
    password: string,
    username: string
  ): Promise<User | null>;
  OtpUser(
    mail: string,
    otp: string,
    username: string,
    password: string
  ): Promise<OtpUser | null>;

  checkOtp(user: checkOtp): Promise<User | null>;
  tempUserExist(email: string): Promise<OtpUser | null>;
  loginUser(email: string, password: string): Promise<User | null | string>;

  // getUserDetails(id: any): Promise<UserDocuments | null>;
  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
  resendOtp(email: string, otp: string): Promise<User | null>;
  updateUserPassword(
    id: mongoose.Types.ObjectId,
    newPassword: string
  ): Promise<UserDocuments | null>;

  getAllEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>;
  getAllPerformer(id: mongoose.Types.ObjectId): Promise<Performer[] | null>;
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
  walletHistory(
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null>;
  availableDate(
    formData: Record<string, any>,
    eventId: string,
    performerId: string
  ): Promise<boolean>;

  ratingAdded(
    bookingId: mongoose.Types.ObjectId,
    rating: number,
    review: string
  ): Promise<EventDocument | null>;
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
  favaroiteEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>;
  sendMessage(
    senderId: mongoose.Types.ObjectId,
    receiverId: mongoose.Types.ObjectId,
    message: string
  ): Promise<ChatRoomDocument | null>;
  ChatWith(
    myIdObject: mongoose.Types.ObjectId,
    anotherIdObject: mongoose.Types.ObjectId
  ): Promise<MessageDocument[] | null>;
  getAllChatRooms(userId: mongoose.Types.ObjectId): Promise<ChatRoom[] | null>;
  // chatWithPerformer(userId:mongoose.Types.ObjectId, performerId:mongoose.Types.ObjectId):Promise<ChatRoomDocument|null>
  getUpcomingEvents(
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]>;

}
