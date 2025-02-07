
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User } from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";

import { UserDocuments } from "../../../../infrastructure/models/userModel";
import mongoose from "mongoose";

import { WalletDocument } from "../../../../infrastructure/models/walletHistory";

export interface IuserUseCase {
  // getAllUser(): Promise<UserDocument[]>;

  loginUser(email: string, password: string): Promise<User | null | string>;
  tempUserExist(email: string): Promise<OtpUser | null>;
  checkOtp(user: checkOtp): Promise<User | null>;
  resendOtp(email: string, otp: string): Promise<User | null>;
  jwt(payload: User): Promise<string | null>;
  verifyOtp(email: string, otp: string): unknown;
  sendmail(email: string, otp: string): unknown;
  userExist(email: string): Promise<User | null>;
  bcrypt(password: string): Promise<string>;
  otpUser(
    email: string,
    otp: string,
    password: string,
    username: string
  ): Promise<OtpUser | null>;

  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
  changePassword(
    id: mongoose.Types.ObjectId,
    oldPassword: string,
    newPassword: string
  ): Promise<UserDocuments | null>;
  walletHistory(
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null>;




}
