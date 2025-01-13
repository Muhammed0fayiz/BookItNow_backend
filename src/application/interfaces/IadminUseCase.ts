import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../domain/entities/tempPerformer";
import { UserDocuments } from "../../infrastructure/models/userModel";
import { Performer } from "../../domain/entities/performer";
import mongoose, { Types } from "mongoose";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { AdminDocument } from "../../infrastructure/models/adminModel";
import { AdminDetails } from "../../domain/entities/adminDetails";


Performer
export interface IadminUseCase {

  


  getAdminDetails():Promise<AdminDetails>
  getReport(startDate: Date,endDate: Date): Promise<AdminDetails>
  adminWallet():Promise<AdminDocument[]|null>



  getTempPerformer():Promise<TempPerformerDocument[]|null>
  grantedPermission(id: string): Promise<Performer>; 
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
  toggleBlockStatus(id:string):Promise<EventDocument|null>
  

  

}
