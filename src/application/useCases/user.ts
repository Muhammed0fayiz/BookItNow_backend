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

export class userUseCase implements IuserUseCase {
  private _repository: IuserRepository;

  constructor(private repository: IuserRepository) {
    this._repository = repository;
  }
  availableDate(formData: Record<string, any>, eventId: string, performerId: string): Promise<boolean> {
    try {

      console.log('formdddddddddd',formData,'ee',performerId)
     
      const bookEvent = this._repository.availableDate(
         formData,
         eventId,
         performerId,

       );
       return bookEvent;
     } catch (error) {
       throw error;
     }
  }
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
  getAllPerformer = async (
    id: mongoose.Types.ObjectId
  ): Promise<Performer[] | null> => {
    try {
     
      return await this._repository.getAllPerformer(id);
    } catch (error) {
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

  getAllEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<EventDocument[] | null> => {
    try {
      return this._repository.getAllEvents(id);
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

      return updatedUser; // Return the updated user document
    } catch (error) {
      console.error("Error changing password :", error);
      throw error; // Re-throw the error for further handling
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

  getUserDetails = async (id: any) => {
    try {
      const response = await this._repository.getUserDetails(id);

      return response ? response : null;
    } catch (error) {
      console.error("error occured");

      return null;
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
      return insertUser; // Return the result
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
            from: process.env.EMAIL_ADDRESS, // Ensure the sender email is set
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

  bcrypt = async (password: string): Promise<string> => {
    try {
      const saltRounds = 10; // Adjust this value as needed
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  };
  jwt = async (payload: User): Promise<string | null> => {
    try {
      // Create the JWT with the user ID included in the payload
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

      // Check if the OTP matches and the entry exists
      if (otpUser) {
        return true; // OTP is valid
      }

      return false; // OTP is invalid
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

  getAllUpcomingEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<UpcomingEventDocument[] | null> => {
    try {
      const upcomingEvents = await this._repository.getAllUpcomingEvents(id);
      return upcomingEvents;
    } catch (error) {
      throw error;
    }
  };
  getAlleventHistory = async (
    id: mongoose.Types.ObjectId
  ): Promise<UpcomingEventDocument[] | null> => {
    try {
      const eventHistory = await this._repository.getAlleventHistory(id);
      return eventHistory;
    } catch (error) {
      throw error;
    }
  };
}
