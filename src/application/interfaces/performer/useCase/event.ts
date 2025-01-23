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



export interface IperformerEventUseCase {
  

  uploadEvents(event: { imageUrl: any; title: any; category: any; userId: Types.ObjectId; price: number | null; teamLeader: any; teamLeaderNumber: number | null; description: any; }): unknown;
  getPerformerEvents(id:string): Promise<EventDocument[]| null>;
  deleteEvent(id:string):Promise<EventDocument|null>
  editEvents(
    eventId: string,
    event: {
      imageUrl?: string; 
      title: string;
      category: string;
      userId: Types.ObjectId;
      price: number;
      teamLeader: string;
      teamLeaderNumber: number;
      description: string;
    }
  ): Promise<EventDocument | null>;
  toggleBlockStatus(id:string):Promise<EventDocument|null>
  getAllUpcomingEvents(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  cancelEvent(id: mongoose.Types.ObjectId): Promise<BookingDocument| null>;

  getAlleventHistory(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[] }>;

  changeEventStatus():Promise<BookingDocument[]|null>
    getUpcomingEvents(performerId:mongoose.Types.ObjectId,page:number): Promise<UpcomingEventDocument[]>;
    getEvent(eventId: mongoose.Types.ObjectId):Promise<EventDocument|null>


}


