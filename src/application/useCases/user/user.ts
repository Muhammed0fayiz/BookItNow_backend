

import { User} from "../../../domain/entities/user";

import { IuserRepository } from '../../interfaces/user/repositary/user';
import { IuserUseCase } from "../../interfaces/user/useCase/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

import { OtpUser } from "../../../domain/entities/otpUser";

import {
  UserDocuments
} from "../../../infrastructure/models/userModel";
import { checkOtp } from "../../../domain/entities/checkOtp";

import { tempUserModel } from "../../../infrastructure/models/tempUser";
import mongoose from "mongoose";

import { WalletDocument } from "../../../infrastructure/models/walletHistory";


export class userUseCase implements IuserUseCase {
  private _repository: IuserRepository;

  constructor(private repository: IuserRepository) {
    this._repository = repository;
  }
  updatedprofile=async(userId: mongoose.Types.ObjectId, username: string, profilePicUrl: string | null): Promise<UserDocuments>=> {
    try {
      return await this._repository.updatedprofile(
        userId,
        username,
        profilePicUrl || null 
      );
    } catch (error) {
      throw error
    }  }
  
 

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
  getUserDetails = async (id: mongoose.Types.ObjectId) => {
    try {
      const response = await this._repository.getUserDetails(id);

      return response ? response : null;
    } catch (error) {
      console.error("error occured",error);

      return null;
    }
  };


}
