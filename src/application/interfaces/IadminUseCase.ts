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


Performer
export interface IadminUseCase {

  

  grantedPermission(id: string): Promise<Performer>; // Ensure this method takes an argument
  rejectedPermission(id: string): Promise<TempPerformer>; 
  getUserDetails(id: string): unknown;
  
  getAllUser(): Promise<UserDocument[]>;
 
  performerStatusChange(
    id: string,
    isblocked: boolean,
    isPerfomerBlock: boolean
  ): Promise<User>; // Include isverified

 

  getTempPerformer():Promise<TempPerformerDocument[]|null>
  
  userStatusChange(id: string, isblocked: boolean): Promise<User>;

  performerStatusChange(
    id: string,
    isblocked: boolean,
    isPerfomerBlock: boolean
  ): Promise<User>; // Include isverified
  getAllPerformer():Promise<Performer[]|null>
  
}
