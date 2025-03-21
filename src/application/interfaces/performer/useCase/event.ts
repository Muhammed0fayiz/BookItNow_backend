
import { EventDocument } from '../../../../infrastructure/models/eventsModel';
import mongoose, { Types } from "mongoose";
import { UpcomingEventDocument } from '../../../../domain/entities/upcomingevent';
import { BookingDocument } from '../../../../infrastructure/models/bookingEvents';




export interface IperformerEventUseCase {
  

  uploadedEvents(event: {
    imageUrl: string; 
    title: string;
    category: string;
    userId: Types.ObjectId;
    price: number;
    teamLeader: string;
    teamLeaderNumber: number;
    description: string;
  }): Promise<EventDocument | null | string>;
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
  ): Promise<EventDocument | null | string>;
  toggleBlockStatus(id:string):Promise<EventDocument|null>
  getAllUpcomingEvents(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  cancelEvent(id: mongoose.Types.ObjectId): Promise<BookingDocument| null>;

  getAlleventHistory(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[] }>;

  changeEventStatus():Promise<BookingDocument[]|null>
    getUpcomingEvents(performerId:mongoose.Types.ObjectId,page:number): Promise<UpcomingEventDocument[]>;
    getEvent(eventId: mongoose.Types.ObjectId):Promise<EventDocument|null>
    appealSend(eventId:mongoose.Types.ObjectId,email:string,appealMessage:string):Promise<EventDocument|null>

}


