import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import mongoose, { Types } from "mongoose";
import { Performer } from "../../domain/entities/performer";

import {
  TempPerformer,

} from "../../domain/entities/tempPerformer";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { AdminDocument } from "../../infrastructure/models/adminModel";
import { AdminDetails } from "../../domain/entities/adminDetails";
export interface IadminRepository {

  getAllUser(): Promise<UserDocument[]>;

  userStatusChange(id: string, isblocked: boolean): Promise<User>;
  performerStatusChange(
    id: string,
    isblocked: boolean,
    isPerfomerBlock: boolean
  ): Promise<User>; // Include isverified



  getTempPerformer():Promise<TempPerformerDocument[]|null>
  // resendOtp(email:string):Promise<OtpUser>

  grantedPermission(id:string): Promise<Performer>; // Ensure this method takes an argument
  rejectedPermission(id:string): Promise<TempPerformer>;
  getAllPerformer():Promise<Performer[]|null>
  getAllEvents(): Promise<EventDocument[]| null>;
  toggleBlockStatus(id:string):Promise<EventDocument|null>
  adminWallet():Promise<AdminDocument[]|null>
  getAdminDetails():Promise<AdminDetails>
  getReport(startDate: Date,endDate: Date): Promise<AdminDetails>
}
