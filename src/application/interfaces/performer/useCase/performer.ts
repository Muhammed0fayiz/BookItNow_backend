import { SlotDocuments } from '../../../../infrastructure/models/slotModel';
import { performerDocument } from '../../../../domain/entities/performer';
import {
  TempPerformerDocument,
} from "../../../../domain/entities/tempPerformer";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import { asPerformer } from "../../../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { SlotMangement } from '../../../../domain/entities/slot';
import { performerAllDetails } from '../../../../domain/entities/performerAllDetails';
import { PerformerReport } from '../../../../domain/entities/performerReport';
import { PerformerDocuments } from '../../../../infrastructure/models/performerModel';



export interface IperformerUseCase {
  jwt(payload: asPerformer): Promise<string | null>;
  loginPerformer(email: string, password: string): Promise<asPerformer| null | string>;
  getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
  videoUpload(bandName:string,mobileNumber:string,description:string,user_id:mongoose.Types.ObjectId,video:unknown): Promise<TempPerformerDocument | null>;
  getAllUsers(id: mongoose.Types.ObjectId):Promise<UserDocuments[]|null>
    getReport(performerId:mongoose.Types.ObjectId,startDate: Date,endDate: Date): Promise<PerformerReport|null>

    performerAllDetails(id: mongoose.Types.ObjectId): Promise<performerAllDetails| null>;

    updateslot(id:mongoose.Types.ObjectId, date: Date): Promise<SlotDocuments | null |string>;
    slotDetails(id:mongoose.Types.ObjectId): Promise<SlotMangement | null>;
    updatePerformerProfile(
      objectId: mongoose.Types.ObjectId,
      updateData: Partial<PerformerDocuments>
    ): Promise<PerformerDocuments>;
    
}


