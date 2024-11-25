import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import { asPerformer } from "../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { performerDocument } from "../../domain/entities/performer";
import { EventDocument } from './../../infrastructure/models/eventsModel';

export interface IperformerRepository {
   

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
}

