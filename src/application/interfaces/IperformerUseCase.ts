import { EventDocument } from './../../infrastructure/models/eventsModel';
import { performerDocument } from './../../domain/entities/performer';
import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../domain/entities/tempPerformer";
import { UserDocuments } from "../../infrastructure/models/userModel";
import { asPerformer } from "../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";



export interface IperformerUseCase {
  uploadEvents(event: { imageUrl: any; title: any; category: any; userId: Types.ObjectId; price: number | null; teamLeader: any; teamLeaderNumber: number | null; description: any; }): unknown;
    
  
  jwt(payload: asPerformer): Promise<string | null>;


  loginPerformer(email: string, password: string): Promise<asPerformer| null|string>;
  getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
  videoUpload(bandName:string,mobileNumber:string,description:string,user_id:mongoose.Types.ObjectId,video:any): Promise<TempPerformerDocument | null>;
  getPerformerEvents(id:string): Promise<EventDocument[]| null>;
  deleteEvent(id:string):Promise<EventDocument|null>


}


