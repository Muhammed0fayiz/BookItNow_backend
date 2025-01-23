import { FavoriteDocument } from "../../../infrastructure/models/FavoriteScema";
import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { BookingDocument } from "../../../infrastructure/models/bookingEvents";
import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../domain/entities/user";
import { checkOtp } from "../../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../..//domain/entities/tempPerformer";
import { UserDocuments } from "../../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { Performer } from "../../../domain/entities/performer";
import { WalletDocument } from "../../../infrastructure/models/walletHistory";
import { ChatRoomDocument } from "../../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../domain/entities/chatRoom";
import { MessageNotification } from "../../../domain/entities/messageNotification";
import {  eventRating } from "../../../domain/entities/eventRating";
export interface IChatUseCase {
  // getAllUser(): Promise<UserDocument[]>;

 
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
  chatWithPerformer(
    userId: mongoose.Types.ObjectId,
    performerId: mongoose.Types.ObjectId
  ): Promise<ChatRoomDocument | null>;
  CheckOnline(
    id: mongoose.Types.ObjectId,
    oId: mongoose.Types.ObjectId
  ): Promise<boolean>;
  getMessageNotification(
    userId: mongoose.Types.ObjectId
  ): Promise<MessageNotification | null>;
  onlineUser(
    uId: mongoose.Types.ObjectId,
    pId: mongoose.Types.ObjectId
  ): Promise<ChatRoom | null>;
  offlineUser(userId: mongoose.Types.ObjectId): Promise<ChatRoom[] | null>;
}
