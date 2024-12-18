import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import { asPerformer } from "../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { performerDocument } from "../../domain/entities/performer";
import { EventDocument } from './../../infrastructure/models/eventsModel';
import { UpcomingEventDocument } from "../../domain/entities/upcomingevent";
import { BookingDocument } from "../../infrastructure/models/bookingEvents";
import { SlotDocuments } from "../../infrastructure/models/slotModel";
import { SlotMangement } from "../../domain/entities/slot";
import { performerAllDetails } from "../../domain/entities/performerAllDetails";
import { PerformerReport } from "../../domain/entities/performerReport";

export interface IperformerRepository {
  // updateslot(id: Types.ObjectId, date: Date): SlotDocuments | PromiseLike<SlotDocuments | null> | null;
   

    loginPerformer(email: string, password: string): Promise<asPerformer | null|string>;
    getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
 
    videoUploadDB(bandName:string,mobileNumber:string,description:string,user_id:mongoose.Types.ObjectId,s3Location:any): Promise<TempPerformerDocument | null>;
    uploadedEvent(event: { imageUrl: any; id: any; title: any; category: any; userId: any; price: any; teamLeader: any; teamLeaderNumber: any; description: any; }): Promise<EventDocument|null>;
    getPerformerEvents(id:string): Promise<EventDocument[]| null>;
    deleteEvent(id:string):Promise<EventDocument|null>
    editEvents(
        eventId: string,
        event: {
          imageUrl?: string; // optional field to allow keeping the existing image
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
      getAllUpcomingEvents(id: mongoose.Types.ObjectId): Promise<UpcomingEventDocument[] | null>;
      cancelEvent(id: mongoose.Types.ObjectId): Promise<BookingDocument| null>;
      slotDetails(id: mongoose.Types.ObjectId): Promise<SlotMangement | null>;
      updateslot(id: mongoose.Types.ObjectId, date: Date): Promise<SlotDocuments | null | string>;
      getAlleventHistory(id: mongoose.Types.ObjectId): Promise<UpcomingEventDocument[] | null>;
      performerAllDetails(id: mongoose.Types.ObjectId): Promise<performerAllDetails| null>;
      changeEventStatus():Promise<BookingDocument[]|null>
      getAllUsers(id: mongoose.Types.ObjectId):Promise<UserDocuments[]|null>
    getReport(performerId:mongoose.Types.ObjectId,startDate: Date,endDate: Date): Promise<PerformerReport|null>
}

