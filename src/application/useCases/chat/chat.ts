import { IChatUseCase } from './../../interfaces/chat/IchatUseCase';
import { IChatRepository } from './../../interfaces/chat/IchatRepositary';


import { ChatRoomDocument } from "../../../infrastructure/models/chatRoomModel";

import mongoose, { Types } from "mongoose";

import { MessageDocument } from "../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../domain/entities/chatRoom";
import { MessageNotification } from "../../../domain/entities/messageNotification";


export class chatUseCase implements IChatUseCase {
  private _repository: IChatRepository;

  constructor(private repository: IChatRepository) {
    this._repository = repository;
  }
 

 

  CheckOnline = async (
    id: mongoose.Types.ObjectId,
    oId: mongoose.Types.ObjectId
  ): Promise<boolean> => {
    try {
      return this._repository.CheckOnline(id, oId);
    } catch (error) {}
    throw new Error("Method not implemented.");
  };
  offlineUser = async (
    userId: mongoose.Types.ObjectId
  ): Promise<ChatRoom[] | null> => {
    try {
      return await this._repository.offlineUser(userId);
    } catch (error) {
      throw error;
    }
  };
  onlineUser = async (
    uId: mongoose.Types.ObjectId,
    pId: mongoose.Types.ObjectId
  ): Promise<ChatRoom | null> => {
    try {
      return await this._repository.onlineUser(uId, pId);
    } catch (error) {
      throw error;
    }
  };
  getMessageNotification = async (
    userId: mongoose.Types.ObjectId
  ): Promise<MessageNotification | null> => {
    try {
      const getMessageNotification =
        await this._repository.getMessageNotification(userId);
      return getMessageNotification;
    } catch (error) {
      throw error;
    }
  };
  chatWithPerformer = async (
    userId: mongoose.Types.ObjectId,
    performerId: mongoose.Types.ObjectId
  ): Promise<ChatRoomDocument | null> => {
    try {
      return await this._repository.chatWithPerformer(userId, performerId);
    } catch (error) {
      throw error;
    }
  };
  getAllChatRooms = async (
    userId: mongoose.Types.ObjectId
  ): Promise<ChatRoom[] | null> => {
    try {
      return this._repository.getAllChatRooms(userId);
    } catch (error) {
      throw error;
    }
  };
  ChatWith = async (
    myIdObject: mongoose.Types.ObjectId,
    anotherIdObject: mongoose.Types.ObjectId
  ): Promise<MessageDocument[] | null> => {
    try {
      const chatwith = await this._repository.ChatWith(
        myIdObject,
        anotherIdObject
      );

      return chatwith;
    } catch (error) {
      throw error;
    }
  };
  sendMessage = async (
    senderId: mongoose.Types.ObjectId,
    reseverId: mongoose.Types.ObjectId,
    message: string
  ): Promise<ChatRoomDocument | null> => {
    try {
      return await this._repository.sendMessage(senderId, reseverId, message);
    } catch (error) {
      throw error;
    }
  };
}
