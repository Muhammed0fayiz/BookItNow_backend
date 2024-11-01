import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../domain/entities/tempPerformer";
import { UserDocuments } from "../../infrastructure/models/userModel";
import mongoose from "mongoose";
export interface IuserUseCase {

  
  // getAllUser(): Promise<UserDocument[]>;
  verifyOtp(email: string, otp: string): unknown;
  sendmail(email: string, otp: string): unknown;
  userExist(email: string): Promise<User | null>;
  jwt(payload: User): Promise<string | null>;
  bcrypt(password: string): Promise<string>;
  tempUserExist(email: string): Promise<OtpUser | null>;
  otpUser(
    email: string,
    otp: string,
    password: string,
    username: string
  ): Promise<OtpUser | null>;
  checkOtp(user: checkOtp): Promise<User | null>;
  loginUser(email: string, password: string): Promise<User | null | string>;

  

  // getUserDetails(id: any): Promise<UserDocuments | null>;
  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
 resendOtp(email:string,otp:string):Promise<User|null>
//  updateUserProfile(username: string, image: string, userId: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
changePassword(id: mongoose.Types.ObjectId,oldPassword:string,newPassword:string): Promise<UserDocuments | null>;
}