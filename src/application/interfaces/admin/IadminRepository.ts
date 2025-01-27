import { TempPerformerDocument } from "./../../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../domain/entities/user";
import { checkOtp } from "../../../domain/entities/checkOtp";
import { UserDocuments } from "../../../infrastructure/models/userModel";
import mongoose, { Types } from "mongoose";
import { Performer } from "../../../domain/entities/performer";

import {
  TempPerformer,

} from "../../../domain/entities/tempPerformer";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { AdminDocument } from "../../../infrastructure/models/adminModel";
import { AdminDetails } from "../../../domain/entities/adminDetails";
import { AdminRevenue } from "../../../domain/entities/adminRevenue";
export interface IadminRepository {



  getAdminDetails():Promise<AdminDetails>
  getReport(startDate: Date,endDate: Date): Promise<AdminDetails>
  adminWallet():Promise<AdminDocument[]|null>


  getTempPerformer():Promise<TempPerformerDocument[]|null>
  grantedPermission(id:string): Promise<Performer>;
  rejectedPermission(id:string): Promise<TempPerformer>;
  


  
  getAllPerformer():Promise<Performer[]|null>
  performerStatusChange(
    id: string,
    isblocked: boolean,
    isPerfomerBlock: boolean
  ): Promise<User>; 



  getAllUser(): Promise<UserDocument[]>;
  userStatusChange(id: string, isblocked: boolean): Promise<User>;


  getAllEvents(): Promise<EventDocument[]| null>;
  toggleBlockStatus(
    id: string,
    blockingDetails?: { reason: string; duration: number | string }
  ): Promise<EventDocument | null>;
  getRevenue(offset: number,
    pageSize: number):Promise<{ totalCount: number; adminRevinue: AdminRevenue[] }|null>

}
