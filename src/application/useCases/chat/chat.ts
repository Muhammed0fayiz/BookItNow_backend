import { IChatUseCase } from './../../interfaces/chat/IchatUseCase';
import { IChatRepository } from './../../interfaces/chat/IchatRepositary';


import { ChatRoomDocument } from "../../../infrastructure/models/chatRoomModel";
import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { Response } from "express";
import { User, UserDocument } from "../../../domain/entities/user";
// import { IuserRepository } from "../interfaces/user/";
import { IuserRepository } from '../../interfaces/user/repositary/user';
import { IuserUseCase } from "../../interfaces/user/useCase/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { OtpUser } from "../../../domain/entities/otpUser";

import {
  UserDocuments,
  UserModel,
} from "../../../infrastructure/models/userModel";
import { checkOtp } from "../../../domain/entities/checkOtp";
import {
  TempPerformerDocument,
  TempPerformer,
} from "../../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../../infrastructure/models/tempPerformer";
import { tempUserModel } from "../../../infrastructure/models/tempUser";
import mongoose, { Types } from "mongoose";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { Performer } from "../../../domain/entities/performer";
import { BookingDocument } from "../../../infrastructure/models/bookingEvents";
import { WalletDocument } from "../../../infrastructure/models/walletHistory";
import { SlotModel } from "../../../infrastructure/models/slotModel";
import { FavoriteDocument } from "../../../infrastructure/models/FavoriteScema";
import { MessageDocument } from "../../../infrastructure/models/messageModel";
import { ChatRoom } from "../../../domain/entities/chatRoom";
import { MessageNotification } from "../../../domain/entities/messageNotification";
import { eventRating } from "../../../domain/entities/eventRating";

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
