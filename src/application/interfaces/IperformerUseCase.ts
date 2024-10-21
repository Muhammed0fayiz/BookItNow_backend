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
import mongoose from "mongoose";

export interface IperformerUseCase {
  
  
  jwt(payload: asPerformer): Promise<string | null>;


  loginPerformer(email: string, password: string): Promise<asPerformer| null|string>;
  getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
  videoUpload(bandName:string,mobileNumber:string,description:string,user_id:mongoose.Types.ObjectId,video:any): Promise<TempPerformerDocument | null>;
}


