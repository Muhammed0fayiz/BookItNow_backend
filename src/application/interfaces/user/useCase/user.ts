import { FavoriteDocument } from "../../../../infrastructure/models/FavoriteScema";
import { UpcomingEventDocument } from "../../../../domain/entities/upcomingevent";
import { BookingDocument } from "../../../../infrastructure/models/bookingEvents";
import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../../../domain/entities/tempPerformer";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../../../infrastructure/models/eventsModel";
import { Performer } from "../../../../domain/entities/performer";
import { WalletDocument } from "../../../../infrastructure/models/walletHistory";
import { ChatRoomDocument } from "../../../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../../domain/entities/chatRoom";
import { MessageNotification } from "../../../../domain/entities/messageNotification";
import {  eventRating } from "../../../../domain/entities/eventRating";
export interface IuserUseCase {
  // getAllUser(): Promise<UserDocument[]>;

  loginUser(email: string, password: string): Promise<User | null | string>;
  tempUserExist(email: string): Promise<OtpUser | null>;
  checkOtp(user: checkOtp): Promise<User | null>;
  resendOtp(email: string, otp: string): Promise<User | null>;
  jwt(payload: User): Promise<string | null>;
  verifyOtp(email: string, otp: string): unknown;
  sendmail(email: string, otp: string): unknown;
  userExist(email: string): Promise<User | null>;
  bcrypt(password: string): Promise<string>;
  otpUser(
    email: string,
    otp: string,
    password: string,
    username: string
  ): Promise<OtpUser | null>;

  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
  changePassword(
    id: mongoose.Types.ObjectId,
    oldPassword: string,
    newPassword: string
  ): Promise<UserDocuments | null>;
  walletHistory(
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null>;

  // getAllEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>;
  // userBookEvent(
  //   formData: Record<string, any>,
  //   eventId: string,
  //   performerId: string,
  //   userId: string
  // ): Promise<BookingDocument | null>;
  // getAllUpcomingEvents(
  //   id: mongoose.Types.ObjectId
  // ): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  // cancelEvent(id: mongoose.Types.ObjectId): Promise<BookingDocument | null>;
  // getUpcomingEvents(
  //   userId: mongoose.Types.ObjectId,
  //   page: number
  // ): Promise<UpcomingEventDocument[]>;
  // getAllEventHistory(id: mongoose.Types.ObjectId): Promise<{
  //   totalCount: number;
  //   pastEventHistory: UpcomingEventDocument[];
  // }>;
  // getEventHistory(
  //   userId: mongoose.Types.ObjectId,
  //   page: number
  // ): Promise<{
  //   pastEventHistory: UpcomingEventDocument[];
  // }>;
  // getFilteredEvents(
  //   id: mongoose.Types.ObjectId,
  //   filterOptions: any,
  //   sortOptions: any,
  //   skip: number,
  //   limit: number
  // ): Promise<{ events: EventDocument[]; totalCount: number } | null>;
  // ratingAdded(
  //   bookingId: mongoose.Types.ObjectId,
  //   rating: number,
  //   review: string
  // ): Promise<EventDocument | null>;
  // getEventRating(eventId:mongoose.Types.ObjectId):Promise<eventRating[]|null>
  // favaroiteEvents(
  //   id: mongoose.Types.ObjectId
  // ): Promise<{ totalEvent: number; events: EventDocument[] | null }>;
  // toggleFavoriteEvent(
  //   uid: mongoose.Types.ObjectId,
  //   eid: mongoose.Types.ObjectId
  // ): Promise<FavoriteDocument | null>;
  // userWalletBookEvent(
  //   formData: Record<string, any>,
  //   eventId: string,
  //   performerId: string,
  //   userId: string
  // ): Promise<BookingDocument | null>;

  // getAllPerformer(id: mongoose.Types.ObjectId): Promise<Performer[] | null>;
  // availableDate(
  //   formData: Record<string, any>,
  //   eventId: string,
  //   performerId: string
  // ): Promise<boolean>;
  // getFilteredPerformers(
  //   id: mongoose.Types.ObjectId,
  //   filterOptions: any,
  //   sortOptions: any,
  //   skip: number,
  //   limit: number
  // ): Promise<{ performers: Performer[]; totalCount: number } | null>;

  // sendMessage(
  //   senderId: mongoose.Types.ObjectId,
  //   receiverId: mongoose.Types.ObjectId,
  //   message: string
  // ): Promise<ChatRoomDocument | null>;
  // ChatWith(
  //   myIdObject: mongoose.Types.ObjectId,
  //   anotherIdObject: mongoose.Types.ObjectId
  // ): Promise<MessageDocument[] | null>;
  // getAllChatRooms(userId: mongoose.Types.ObjectId): Promise<ChatRoom[] | null>;
  // chatWithPerformer(
  //   userId: mongoose.Types.ObjectId,
  //   performerId: mongoose.Types.ObjectId
  // ): Promise<ChatRoomDocument | null>;
  // CheckOnline(
  //   id: mongoose.Types.ObjectId,
  //   oId: mongoose.Types.ObjectId
  // ): Promise<boolean>;
  // getMessageNotification(
  //   userId: mongoose.Types.ObjectId
  // ): Promise<MessageNotification | null>;
  // onlineUser(
  //   uId: mongoose.Types.ObjectId,
  //   pId: mongoose.Types.ObjectId
  // ): Promise<ChatRoom | null>;
  // offlineUser(userId: mongoose.Types.ObjectId): Promise<ChatRoom[] | null>;
}
