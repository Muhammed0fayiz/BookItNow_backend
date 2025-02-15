import { IperformerEventRepository } from './../../interfaces/performer/repositary/event';
import { IperformerEventUseCase } from './../../interfaces/performer/useCase/event';
import nodemailer from "nodemailer";



import mongoose, { Types } from "mongoose";
import {
  EventDocument,
} from "../../../infrastructure/models/eventsModel";
import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { BookingDocument } from "../../../infrastructure/models/bookingEvents";

export class performerEventUseCase implements IperformerEventUseCase {
  private _repository: IperformerEventRepository;

  constructor(private repository: IperformerEventRepository) {
    this._repository = repository;
  }
  uploadedEvents = async (event: {
    imageUrl: string;
      title: string;
      category: string;
      userId: Types.ObjectId;
      price: number;
      teamLeader: string;
      teamLeaderNumber: number;
      description: string;
  }): Promise<EventDocument | null | string> => {
    try {
     return this._repository.uploadedEvents(event)
    } catch (error) {
      console.error("Error inserting event:", error);
      throw error;
    }
  };
  

  appealSend = async (
    eventId: mongoose.Types.ObjectId,
    email: string,
    appealMessage: string
  ): Promise<EventDocument | null> => {
    try {
      const event: EventDocument | null = await this._repository.getEvent(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: email,
        to: 'fayiz149165@gmail.com', 
        subject: `Appeal for Event: ${event.title}`,
        text: `Hi Admin,\n\nI am the founder of the event titled "${event.title}".\n\n"${appealMessage}"\n\nPlease consider this appeal and let me know if there is anything I can do.\n\nThank you.`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);

      return event;
    } catch (error) {
      console.error('Error sending appeal:', error);
      throw error;
    }
  };
 




  editEvents = async (
    eventId: string,
    event: {
      imageUrl: string;
      title: string;
      category: string;
      userId: Types.ObjectId;
      price: number;
      teamLeader: string;
      teamLeaderNumber: number;
      description: string;
    }
  ): Promise<EventDocument | null | string> => {
    try {
      console.log('use case`');
      
      const updatedEvent = await this._repository.editEvents(eventId, event);
      return updatedEvent;
    } catch (error) {
      throw error;
    }
  };
  toggleBlockStatus = async (id: string): Promise<EventDocument | null> => {
    try {
      return this._repository.toggleBlockStatus(id);
    } catch (error) {
      throw error;
    }
  };
  getAllUpcomingEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<{
    totalCount: number;
    upcomingEvents: UpcomingEventDocument[];
  }> => {
    try {
      const result = await this._repository.getAllUpcomingEvents(id);
      return {
        totalCount: result.totalCount,
        upcomingEvents: result.upcomingEvents,
      };
    } catch (error) {
      throw error;
    }
  };
  cancelEvent = async (
    id: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null> => {
    try {
      return await this._repository.cancelEvent(id);
    } catch (error) {
      throw error;
    }
  };
  getAlleventHistory=async(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[]; }>=> {
    try {
      const result = await this._repository.getAlleventHistory(id);
      return {
        totalCount: result.totalCount,
        eventHistory: result.eventHistory,
      };
    } catch (error) {
      throw error;
    }
  }


  // getAlleventHistory=asy(id: unknown): Promise<UpcomingEventDocument[] | null> | Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[]; }> {
  //   throw new Error("Method not implemented.");
  // }
  // getAlleventHistory = async (
  //   id: mongoose.Types.ObjectId
  // ): Promise<UpcomingEventDocument[] | null> => {
  //   try {
  //     const eventHistory = await this._repository.getAlleventHistory(id);
  //     return eventHistory;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  changeEventStatus = async (): Promise<BookingDocument[] | null> => {
    try {
      return await this._repository.changeEventStatus();
    } catch (error) {
      throw error;
    }
  };
  getUpcomingEvents = async (
    performerId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]> => {
    try {
      const response = await this._repository.getUpcomingEvents(
        performerId,
        page
      );

      return response;
    } catch (error) {
      console.error("Error in getUpcomingEvents usecase:", error);
      throw error;
    }
  };
  getPerformerEvents = async (id: string): Promise<EventDocument[] | null> => {
    try {
      const performerEvents = await this._repository.getPerformerEvents(id);

      return performerEvents;
    } catch (error) {
      throw error;
    }
  };
  deleteEvent(id: string): Promise<EventDocument | null> {
    try {
      return this._repository.deleteEvent(id);
    } catch (error) {
      throw error;
    }
  }
  getEvent=async(eventId: mongoose.Types.ObjectId): Promise<EventDocument | null> =>{
    try {
      return this._repository.getEvent(eventId)
    } catch (error) {
     throw error
    }
   }
}
