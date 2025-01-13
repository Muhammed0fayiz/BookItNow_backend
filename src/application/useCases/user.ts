import { ChatRoomDocument } from "./../../infrastructure/models/chatRoomModel";
import { UpcomingEventDocument } from "./../../domain/entities/upcomingevent";
import { Response } from "express";
import { User, UserDocument } from "../../domain/entities/user";
import { IuserRepository } from "../interfaces/IuserRepository";
import { IuserUseCase } from "../interfaces/IuserUseCase";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { OtpUser } from "../../domain/entities/otpUser";

import {
  UserDocuments,
  UserModel,
} from "../../infrastructure/models/userModel";
import { checkOtp } from "../../domain/entities/checkOtp";
import {
  TempPerformerDocument,
  TempPerformer,
} from "../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../infrastructure/models/tempPerformer";
import { tempUserModel } from "../../infrastructure/models/tempUser";
import mongoose, { Types } from "mongoose";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { Performer } from "../../domain/entities/performer";
import { BookingDocument } from "../../infrastructure/models/bookingEvents";
import { WalletDocument } from "../../infrastructure/models/walletHistory";
import { SlotModel } from "../../infrastructure/models/slotModel";
import { FavoriteDocument } from "../../infrastructure/models/FavoriteScema";
import { MessageDocument } from "../../infrastructure/models/messageModel";
import { ChatRoom } from "../../domain/entities/chatRoom";
import { MessageNotification } from "../../domain/entities/messageNotification";

export class userUseCase implements IuserUseCase {
  private _repository: IuserRepository;

  constructor(private repository: IuserRepository) {
    this._repository = repository;
  }

  userExist = async (email: string): Promise<User | null> => {
    try {
      return await this._repository.userExist(email);
    } catch (error) {
      throw error;
    }
  };
  verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const otpUser = await tempUserModel.findOne({ email, otp });

      if (otpUser) {
        return true;
      }

      return false;
    } catch (error) {
      throw error;
    }
  };
  bcrypt = async (password: string): Promise<string> => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  };
  jwt = async (payload: User): Promise<string | null> => {
    try {
      const token = jwt.sign(
        {
          id: payload._id,
          username: payload.username,
          email: payload.email,
          role: "user",
        },
        "loginsecrit",
        { expiresIn: "2h" }
      );

      if (token) {
        return token;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  loginUser = async (
    email: string,
    password: string
  ): Promise<User | null | string> => {
    try {
      return await this.repository.loginUser(email, password);
    } catch (error) {
      throw error;
    }
  };
  tempUserExist = async (email: string): Promise<OtpUser | null> => {
    try {
      return await this._repository.tempUserExist(email);
    } catch (error) {
      throw error;
    }
  };
  checkOtp = async (user: checkOtp): Promise<User | null> => {
    try {
      const insertUser = await this.repository.checkOtp(user);
      return insertUser;
    } catch (error) {
      throw error;
    }
  };
  otpUser = async (
    email: string,
    otp: string,
    username: string,
    password: string
  ): Promise<OtpUser | null> => {
    try {
      const insertedOtpUser = await this._repository.OtpUser(
        email,
        otp,
        username,
        password
      );

      if (insertedOtpUser) {
        await this.sendmail(email, otp);
      }

      return insertedOtpUser;
    } catch (error) {
      throw error;
    }
  };
  sendmail = async (email: string, otp: string): Promise<string> => {
    try {
      console.log("otp send mailer is", otp);
      const sendOtpEmail = async (
        email: string,
        otp: string
      ): Promise<string> => {
        return new Promise((resolve, reject) => {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "One-Time Password (OTP) for Authentication",
            html: `
            <div style="font-family: Arial, sans-serif;">
              <p>Dear User,</p>
              <p>Your One-Time Password (OTP) for authentication is: <h1>${otp}</h1></p>
              <p>Please click the button below to verify your account:</p>
             
              
            </div>
          `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve(info.response);
              console.log("mailsend");
            }
          });
        });
      };

      const mailSent = await sendOtpEmail(email, otp);
      return mailSent;
    } catch (error) {
      console.error("Error in sending mail:", error);
      throw error;
    }
  };
  resendOtp = async (email: string, otp: string): Promise<User | null> => {
    try {
      console.log(email, otp, "otp sent");

      const otpUser = await this._repository.resendOtp(email, otp);

      if (otpUser) {
        this.sendmail(email, otp);
        console.log("otp user", otpUser);
      }
      return otpUser ? otpUser : null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  walletHistory = async (
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null> => {
    try {
      const walletHistory = this._repository.walletHistory(objectId);
      return walletHistory;
    } catch (error) {
      throw error;
    }
  };
  changePassword = async (
    id: mongoose.Types.ObjectId,
    oldPassword: string,
    newPassword: string
  ): Promise<UserDocuments | null> => {
    try {
      const user = await this._repository.getUserDetails(id);
      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new Error("Old password is incorrect");
      }

      const hashedNewPassword = await this.bcrypt(newPassword);

      user.password = hashedNewPassword;
      const updatedUser = await this._repository.updateUserPassword(
        id,
        newPassword
      );

      return updatedUser;
    } catch (error) {
      console.error("Error changing password :", error);
      throw error;
    }
  };
  getUserDetails = async (id: any) => {
    try {
      const response = await this._repository.getUserDetails(id);

      return response ? response : null;
    } catch (error) {
      console.error("error occured");

      return null;
    }
  };

  getAllEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<EventDocument[] | null> => {
    try {
      return this._repository.getAllEvents(id);
    } catch (error) {
      throw error;
    }
  };
  toggleFavoriteEvent = async (
    uid: mongoose.Types.ObjectId,
    eid: mongoose.Types.ObjectId
  ): Promise<FavoriteDocument | null> => {
    try {
      return this._repository.toggleFavoriteEvent(uid, eid);
    } catch (error) {
      throw error;
    }
  };
  ratingAdded = async (
    bookingId: mongoose.Types.ObjectId,
    rating: number,
    review: string
  ): Promise<EventDocument | null> => {
    try {
      return this._repository.ratingAdded(bookingId, rating, review);
    } catch (error) {
      throw error;
    }
  };
  userBookEvent = async (
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null> => {
    try {
      const bookEvent = this._repository.userBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );
      return bookEvent;
    } catch (error) {
      throw error;
    }
  };
  userWalletBookEvent = async (
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null> => {
    try {
      const walletbooking = this._repository.userWalletBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );
      return walletbooking;
    } catch (error) {
      throw error;
    }
  };
  getAllUpcomingEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<{
    totalCount: number;
    upcomingEvents: UpcomingEventDocument[];
  }> => {
    try {
      const result = await this._repository.getAllUpcomingEvents(id);
      return {
        totalCount: result.totalCount,
        upcomingEvents: result.upcomingEvents,
      };
    } catch (error) {
      throw error;
    }
  };
  getAllEventHistory = async (
    id: mongoose.Types.ObjectId
  ): Promise<{
    totalCount: number;
    pastEventHistory: UpcomingEventDocument[];
  }> => {
    try {
      const result = await this._repository.getAllEventHistory(id);
      return {
        totalCount: result.totalCount,
        pastEventHistory: result.pastEventHistory,
      };
    } catch (error) {
      throw error;
    }
  };
  getEventHistory = async (
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<{
    pastEventHistory: UpcomingEventDocument[];
  }> => {
    try {
      // Make sure you're calling the correct method, not the one that leads to recursion.
      const response = await this._repository.getEventHistory(userId, page); // <-- Call the correct method

      return response; // Return the response correctly
    } catch (error) {
      console.error("Error in getEventHistory usecase:", error);
      throw error; // Propagate the error to be handled by the caller
    }
  };
  getFilteredEvents = async (
    id: mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ events: EventDocument[]; totalCount: number } | null> => {
    try {
      const filteredEvents = await this._repository.getFilteredEvents(
        id,
        filterOptions,
        sortOptions,
        skip,
        limit
      );
      return filteredEvents;
    } catch (error) {
      throw error;
    }
  };
  favaroiteEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<{ totalEvent: number; events: EventDocument[] | null }> => {
    try {
      return this._repository.favaroiteEvents(id);
    } catch (error) {
      throw error;
    }
  };
  getUpcomingEvents = async (
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]> => {
    try {
      const response = await this._repository.getUpcomingEvents(userId, page);

      return response;
    } catch (error) {
      console.error("Error in getUpcomingEvents usecase:", error);
      throw error;
    }
  };
  cancelEvent = async (
    id: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null> => {
    try {
      return await this._repository.cancelEvent(id);
    } catch (error) {
      throw error;
    }
  };

  getFilteredPerformers = async (
    id: mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ performers: Performer[]; totalCount: number } | null> => {
    try {
      const filteredPerformers = await this._repository.getFilteredPerformers(
        id,
        filterOptions,
        sortOptions,
        skip,
        limit
      );
      return filteredPerformers;
    } catch (error) {
      throw error;
    }
  };
  availableDate(
    formData: Record<string, any>,
    eventId: string,
    performerId: string
  ): Promise<boolean> {
    try {
      const bookEvent = this._repository.availableDate(
        formData,
        eventId,
        performerId
      );
      return bookEvent;
    } catch (error) {
      throw error;
    }
  }
  getAllPerformer = async (
    id: mongoose.Types.ObjectId
  ): Promise<Performer[] | null> => {
    try {
      return await this._repository.getAllPerformer(id);
    } catch (error) {
      throw error;
    }
  };

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
