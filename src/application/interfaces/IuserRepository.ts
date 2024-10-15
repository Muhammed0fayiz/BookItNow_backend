import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import mongoose from "mongoose";


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
  loginUser(email: string, password: string): Promise<User | null>;

  // getUserDetails(id: any): Promise<UserDocuments | null>;
  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
  resendOtp(email:string,otp:string):Promise<User|null>
  updateUserPassword(id: mongoose.Types.ObjectId,newPassword:string):Promise<UserDocuments | null>
 
}
