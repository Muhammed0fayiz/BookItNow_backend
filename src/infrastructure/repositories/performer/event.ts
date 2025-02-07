import { IperformerEventRepository } from './../../../application/interfaces/performer/repositary/event';

import { PerformerModel } from "../../models/performerModel";

import mongoose from "mongoose";



import { UserModel } from "../../models/userModel";


import { Types } from "mongoose";
import { EventDocument, EventModel } from "../../models/eventsModel";
import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { BookingDocument, BookingModel } from "../../models/bookingEvents";
import { WalletModel } from "../../models/walletHistory";

export class performerEventRepository implements IperformerEventRepository {


 

  deleteEvent = async (id: string): Promise<EventDocument | null> => {
    try {
      const deleteEvent = await EventModel.findByIdAndDelete(id);
      return deleteEvent;
    } catch (error) {
      throw error;
    }
  };
  getPerformerEvents = async (id: string): Promise<EventDocument[] | null> => {
    try {
      const performerAllEvents = await EventModel.find({ userId: id });

      return performerAllEvents;
    } catch (error) {
      throw error;
    }
  };
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
      const existingEvent = await EventModel.findOne({
        title: event.title,
        userId: event.userId,
      });
  
      if (existingEvent) {
        return "Event already exists";
      }
  
      const newEvent = await EventModel.create(event);
        
      // Fetch the newly created event
      const createdEvent = await EventModel.findById(newEvent._id);
      
      return createdEvent;

      
    } catch (error) {
      console.error("Error inserting event:", error);
      throw error;
    }
  };
  
  editEvents = async (
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
  ): Promise<EventDocument | null | string> => {
    try {
      const existingEvent = await EventModel.findById(eventId);
      if (!existingEvent) {
        return "Event not found";
      }
  
      const duplicateEvent = await EventModel.findOne({
        _id: { $ne: eventId },
        title: event.title,
        category: event.category,
        price: event.price,
      });
  
      if (duplicateEvent) {
        return "Event already exists";
      }
  
      const updatedEvent = await EventModel.findByIdAndUpdate(
        eventId,
        { $set: event },
        { new: true }
      );
  
      return updatedEvent;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };
  
  toggleBlockStatus = async (id: string): Promise<EventDocument | null> => {
    try {
      const event = await EventModel.findById(id);
      if (!event) return null;
      event.isperformerblockedevents = !event.isperformerblockedevents;
      const updatedEvent = await event.save();
      return updatedEvent;
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
      const currentDate = new Date();
      const performer = await PerformerModel.findOne({ userId: id }).lean();
      if (!performer) {
        throw new Error("Performer not found");
      }

      // First, get the total count of upcoming events (without limit)
      const totalBookingsCount = await BookingModel.countDocuments({
        performerId: performer._id,
        date: { $gte: currentDate },
      });

      // Now, retrieve the upcoming events with limit and sorting
      const bookings = await BookingModel.find({
        performerId: performer._id,
        date: { $gte: currentDate },
      })
        .sort({ date: 1 })
        .limit(9) // Limit applied after counting
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .populate("userId", "name")
        .lean();

      // Map the bookings to the upcoming events
      const upcomingEvents: UpcomingEventDocument[] = await Promise.all(
        bookings.map(async (booking) => {
          const event = booking.eventId as any;
          const user = booking.userId as any;

          return {
            _id: booking._id,
            eventId: booking.eventId,
            performerId: booking.performerId,
            userId: booking.userId,
            username: user.name,
            price: booking.price,
            status: event.status,
            teamLeader: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            rating: event.rating,
            description: event.description,
            imageUrl: event.imageUrl,
            isblocked: event.isblocked,
            advancePayment: booking.advancePayment,
            restPayment: booking.restPayment,
            time: booking.time,
            place: booking.place,
            date: booking.date,
            bookingStatus: booking.bookingStatus,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            title: event.title,
            category: event.category,
          } as unknown as UpcomingEventDocument;
        })
      );

      return {
        totalCount: totalBookingsCount,
        upcomingEvents,
      };
    } catch (error) {
      console.error("Error in getAllUpcomingEvents:", error);
      throw error;
    }
  };
  cancelEvent = async (
    id: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null> => {
    try {
      const today = new Date();
      const event = await BookingModel.findById(id);

      if (!event) {
        return null;
      }

      const dateDifferenceInDays = Math.floor(
        (event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dateDifferenceInDays < 5) {
        return null;
      }

      const { userId, advancePayment } = event;

      if (!userId) {
        return null;
      }

      await UserModel.findByIdAndUpdate(userId, {
        $inc: { walletBalance: advancePayment },
      });

      const walletEntry = new WalletModel({
        userId,
        amount: advancePayment,
        transactionType: "credit",
        role: "user",
        date: today,
        description: "Event booking cancelled",
      });
      await walletEntry.save();

      event.bookingStatus = "canceled";
      const updatedEvent = await event.save();

      return updatedEvent;
    } catch (error) {
      console.error("Error canceling event:", error);
      throw error;
    }
  };

  getAlleventHistory=async(id: mongoose.Types.ObjectId): Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[]; }>=> {
    try {
      const currentDate = new Date();
      const performer = await PerformerModel.findOne({ userId: id }).lean();
      if (!performer) {
        throw new Error("Performer not found");
      }
  
      // Get total count of past events
      const totalEventHistoryCount = await BookingModel.countDocuments({
        performerId: performer._id,
        date: { $lt: currentDate },
      });
  
      const bookings = await BookingModel.find({
        performerId: performer._id,
        date: { $lt: currentDate },
      })
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .populate("userId", "name")
        .lean();
  
      const eventHistory: UpcomingEventDocument[] = bookings.map((booking) => {
        const event = booking.eventId as any;
        const user = booking.userId as any;
  
        return {
          _id: booking._id,
          eventId: booking.eventId,
          performerId: booking.performerId,
          userId: booking.userId,
          username: user?.name,
          price: booking.price,
          status: event?.status,
          teamLeader: event?.teamLeader,
          teamLeaderNumber: event?.teamLeaderNumber,
          rating: event?.rating,
          description: event?.description,
          imageUrl: event?.imageUrl,
          isblocked: event?.isblocked,
          advancePayment: booking.advancePayment,
          restPayment: booking.restPayment,
          time: booking.time,
          place: booking.place,
          date: booking.date,
          bookingStatus: booking.bookingStatus,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          title: event?.title,
          category: event?.category,
        } as unknown as UpcomingEventDocument;
      });
  
      console.log('pasfffft',totalEventHistoryCount);
      
      return {
        totalCount: totalEventHistoryCount,
        eventHistory,
      };
    } catch (error) {
      console.error("Error in getAlleventHistory:", error);
      throw error;
    }

   
  }

  
  changeEventStatus = async (): Promise<BookingDocument[] | null> => {
    try {
      const events = await BookingModel.find({
        date: { $lt: new Date() },
        bookingStatus: { $ne: "canceled" },
      });

      if (events.length === 0) {
        return null;
      }

      const updatedEvents = await Promise.all(
        events.map(async (event) => {
          event.bookingStatus = "completed";
          return await event.save();
        })
      );

      return updatedEvents;
    } catch (error) {
      throw error;
    }
  };
  getUpcomingEvents = async (
    performerId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]> => {
    try {
      const currentDate = new Date();
      const performer = await PerformerModel.findOne({
        userId: performerId,
      }).lean();
      if (!performer) {
        throw new Error("Performer not found");
      }
      const pageSize = 9;
      const skip = (page - 1) * pageSize;

      const matchQuery = {
        performerId: performer._id,
        date: { $gte: currentDate },
      };

      const bookings = await BookingModel.find(matchQuery)
        .sort({ date: 1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("userId", "name")
        .lean();

      const upcomingEvents: UpcomingEventDocument[] = bookings.map(
        (booking) => {
          const event = booking.eventId as any;
          const user = booking.userId as any;

          return {
            _id: booking._id,
            eventId: booking.eventId,
            performerId: booking.performerId,
            userId: booking.userId,
            username: user.name,
            price: booking.price,
            status: event.status,
            teamLeader: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            rating: event.rating,
            description: event.description,
            imageUrl: event.imageUrl,
            isblocked: event.isblocked,
            advancePayment: booking.advancePayment,
            restPayment: booking.restPayment,
            time: booking.time,
            place: booking.place,
            date: booking.date,

            bookingStatus: booking.bookingStatus,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            title: event.title,
            category: event.category,
          } as unknown as UpcomingEventDocument;
        }
      );

      return upcomingEvents;
    } catch (error) {
      console.error("Error in getUpcomingEvents:", error);
      throw error;
    }
  };
  getEvent=async(eventId: mongoose.Types.ObjectId): Promise<EventDocument | null> =>{
    try {
     const event=await EventModel.findById(eventId)
     return event
    } catch (error) {
      throw error
    }
  }
 
}
