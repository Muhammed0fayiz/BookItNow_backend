
import { User, UserDocument } from "../../../domain/entities/user";

import {
  TempPerformer,
  TempPerformerDocument,
} from "../../../domain/entities/tempPerformer";

import { Performer } from "../../../domain/entities/performer";

import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { AdminDocument } from "../../../infrastructure/models/adminModel";
import { AdminDetails } from "../../../domain/entities/adminDetails";
import { AdminRevenue } from "../../../domain/entities/adminRevenue";
import mongoose from "mongoose";


export interface IadminUseCase {

  


  getAdminDetails():Promise<AdminDetails>
  getReport(startDate: Date,endDate: Date): Promise<AdminDetails>
  adminWallet():Promise<AdminDocument[]|null>



  getTempPerformer():Promise<TempPerformerDocument[]|null>
  grantedPermission(id: mongoose.Types.ObjectId): Promise<Performer>; 
  rejectedPermission(id: string,rejectReason:string): Promise<TempPerformer>; 

  



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
    blockingDetails?: { reason: string; duration: number | string  }
  ): Promise<EventDocument | null>;
  getRevenue(offset: number,
    pageSize: number):Promise<{ totalCount: number; adminRevinue: AdminRevenue[] }|null>
  

}
