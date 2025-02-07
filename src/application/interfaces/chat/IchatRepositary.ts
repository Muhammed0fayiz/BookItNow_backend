
import mongoose from "mongoose";

import { ChatRoomDocument } from "../../../infrastructure/models/chatRoomModel";
import { MessageDocument } from "../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../domain/entities/chatRoom";

import { MessageNotification } from "../../../domain/entities/messageNotification";



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
