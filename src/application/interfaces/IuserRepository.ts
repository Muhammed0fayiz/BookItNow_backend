import { UpcomingEventDocument } from './../../domain/entities/upcomingevent';
import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import mongoose from "mongoose";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { Performer } from "../../domain/entities/performer";
import { BookingDocument } from "../../infrastructure/models/bookingEvents";
import { WalletDocument } from '../../infrastructure/models/walletHistory';
import { SlotDocuments } from '../../infrastructure/models/slotModel';


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
  loginUser(email: string, password: string): Promise<User | null | string> ;

  // getUserDetails(id: any): Promise<UserDocuments | null>;
  getUserDetails(id: mongoose.Types.ObjectId): Promise<UserDocuments | null>;
  resendOtp(email:string,otp:string):Promise<User|null>
  updateUserPassword(id: mongoose.Types.ObjectId,newPassword:string):Promise<UserDocuments | null>

  getAllEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[]| null>;
  getAllPerformer(id: mongoose.Types.ObjectId):Promise<Performer[]|null>
  userBookEvent(
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;
  getAllUpcomingEvents(id: mongoose.Types.ObjectId): Promise<UpcomingEventDocument[] | null>;
  cancelEvent(objectId: mongoose.Types.ObjectId): Promise<BookingDocument| null>;
  walletHistory(objectId: mongoose.Types.ObjectId):Promise<WalletDocument[]|null>
 
}