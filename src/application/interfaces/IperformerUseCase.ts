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

  addTempPerformer(
    bandName: string,
    place: string,
    videoUrl: string,
    category: string,
    description: string,
    userId: string
  ): Promise<TempPerformerDocument>;
  loginPerformer(email: string, password: string): Promise<asPerformer| null>;
  getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
}
