import { SlotDocuments } from '../../../../infrastructure/models/slotModel';
import { IEvent } from '../../../../domain/entities/iEvents';
import { EventDocument } from '../../../../infrastructure/models/eventsModel';
import { performerDocument } from '../../../../domain/entities/performer';
import { getNameOfJSDocTypedef } from "typescript";
import { OtpUser } from "../../../../domain/entities/otpUser";
import { User, UserDocument } from "../../../../domain/entities/user";
import { checkOtp } from "../../../../domain/entities/checkOtp";
import {
  TempPerformer,
  TempPerformerDocument,
} from "../../../../domain/entities/tempPerformer";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import { asPerformer } from "../../../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { UpcomingEventDocument } from '../../../../domain/entities/upcomingevent';
import { BookingDocument } from '../../../../infrastructure/models/bookingEvents';
import { SlotMangement } from '../../../../domain/entities/slot';
import { performerAllDetails } from '../../../../domain/entities/performerAllDetails';
import { PerformerReport } from '../../../../domain/entities/performerReport';



export interface IperformerUseCase {
  jwt(payload: asPerformer): Promise<string | null>;
  loginPerformer(email: string, password: string): Promise<asPerformer| null | string>;
  getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
  videoUpload(bandName:string,mobileNumber:string,description:string,user_id:mongoose.Types.ObjectId,video:any): Promise<TempPerformerDocument | null>;
  getAllUsers(id: mongoose.Types.ObjectId):Promise<UserDocuments[]|null>
    getReport(performerId:mongoose.Types.ObjectId,startDate: Date,endDate: Date): Promise<PerformerReport|null>

    performerAllDetails(id: mongoose.Types.ObjectId): Promise<performerAllDetails| null>;

    updateslot(id:mongoose.Types.ObjectId, date: Date): Promise<SlotDocuments | null |string>;
    slotDetails(id:mongoose.Types.ObjectId): Promise<SlotMangement | null>;
   
}


