
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User} from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { WalletDocument } from "../../../../infrastructure/models/walletHistory";



export interface IuserRepository {


  loginUser(email: string, password: string): Promise<User | null | string>;
  tempUserExist(email: string): Promise<OtpUser | null>;
  checkOtp(user: checkOtp): Promise<User | null>;
  resendOtp(email: string, otp: string): Promise<User | null>;
  userExist(email: string): Promise<User | null>;
  OtpUser(
    mail: string,
    otp: string,
    username: string,
    password: string
  ): Promise<OtpUser | null>;
  insertUser(
    mail: string,
    password: string,
    username: string
  ): Promise<User | null>;




 

  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
  updateUserPassword(
    id: mongoose.Types.ObjectId,
    newPassword: string
  ): Promise<UserDocuments | null>;
  walletHistory(
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null>;



}
