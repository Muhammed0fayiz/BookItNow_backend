import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { TempPerformerDocument } from "../../../infrastructure/models/tempPerformer";
import { OtpUser } from "../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../domain/entities/user";
import { checkOtp } from "../../../domain/entities/checkOtp";
import { UserDocuments } from "../../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { Performer } from "../../../domain/entities/performer";
import { BookingDocument } from "../../../infrastructure/models/bookingEvents";
import { WalletDocument } from "../../../infrastructure/models/walletHistory";
import { SlotDocuments } from "../../../infrastructure/models/slotModel";
import { FavoriteDocument } from "../../../infrastructure/models/FavoriteScema";
import { ChatRoomDocument } from "../../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../domain/entities/chatRoom";
import { Reminder } from "../../../domain/entities/reminder";
import { MessageNotification } from "../../../domain/entities/messageNotification";
import { eventRating } from "../../../domain/entities/eventRating";


export interface IChatRepository {

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
  chatWithPerformer(userId:mongoose.Types.ObjectId, performerId:mongoose.Types.ObjectId):Promise<ChatRoomDocument|null>
     getMessageNotification(userId:mongoose.Types.ObjectId):Promise<MessageNotification|null>
     CheckOnline(id: mongoose.Types.ObjectId, oId: mongoose.Types.ObjectId): Promise<boolean>

   onlineUser(uId:mongoose.Types.ObjectId,pId:mongoose.Types.ObjectId):Promise<ChatRoom|null>
    offlineUser(userId:mongoose.Types.ObjectId):Promise<ChatRoom[]|null>
}
