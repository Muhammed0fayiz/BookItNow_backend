import { SlotDocuments, SlotModel } from "./../models/slotModel";
import { PerformerDocuments, PerformerModel } from "./../models/performerModel";
import { TempPerformerDocument } from "./../models/tempPerformer";
import mongoose from "mongoose";
import { IperformerRepository } from "../../application/interfaces/IperformerRepository";
import { User, UserDocument } from "../../domain/entities/user";
import { OtpUser } from "../../domain/entities/otpUser";
// import { OtpDocument, OtpModel } from "../models/otpSession";
import { UserDocuments, UserModel } from "../models/userModel";

import bcrypt from "bcrypt";

import { TempPerformerModel } from "../models/tempPerformer";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { generateOTP } from "../../shared/utils/generateOtp";
import { tempUserModel } from "../models/tempUser";
import { asPerformer } from "../../domain/entities/asPerformer";
import { Types } from "mongoose";
import { performerDocument } from "../../domain/entities/performer";
import { EventDocument, EventModel } from "../models/eventsModel";
import { UpcomingEventDocument } from "../../domain/entities/upcomingevent";
import { BookingDocument, BookingModel } from "../models/bookingEvents";
import { WalletModel } from "../models/walletHistory";
import { SlotMangement } from "../../domain/entities/slot";
import { performerAllDetails } from "../../domain/entities/performerAllDetails";
import { PerformerReport } from "../../domain/entities/performerReport";
export class performerRepository implements IperformerRepository {
 getReport = async (
    performerId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<PerformerReport | null> => {
    try {
      // Find Performer
      const performer = await UserModel.findById(performerId);
      if (!performer) throw new Error('Performer not found');
  
      const performerDetails = await PerformerModel.findOne({ userId: performerId });
      if (!performerDetails) throw new Error('Performer details not found');
  
      // Fetch total programs
      const totalPrograms = await EventModel.countDocuments({ userId: performerId});
          console.log(totalPrograms,'dd','id',performerId)
      // Fetch bookings within the date range
      const bookings = await BookingModel.find({
        performerId: performerDetails._id,
        date: { $gte: startDate, $lte: endDate },
      }).populate('eventId');
  
      // Aggregate booking history
      const totalEventsHistory: Record<string, number> = {};
      const performerRegistrationHistory: Record<string, number> = {};
      const upcomingEvent: PerformerReport['upcomingEvent'] = [];
      const eventHistory: PerformerReport['eventHistory'] = [];
  
      for (const booking of bookings) {
        const event = booking.eventId as unknown as EventDocument;
  
        // Filter completed events for eventHistory
        if (booking.bookingStatus === 'completed') {
          eventHistory.push({
            title: event.title,
            date: booking.date,
            place: booking.place,
            price: event.price,
            rating: event.rating,
            teamLeadername: event.teamLeader, 
            teamLeaderNumber: event.teamLeaderNumber,
            category: event.category,
            status: booking.bookingStatus,
          });
        }
        
        // Filter future events for upcomingEvent
        if (booking.date > new Date()) {
          upcomingEvent.push({
            title: event.title,
            date: booking.date,
            place: booking.place,
            price: event.price,
            rating: event.rating,
            teamLeadername: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            category: event.category,
            status: booking.bookingStatus, // Include status
          });
        }
        
  
        // Count total events history by status
   
  
        // Count performer registrations per month
        const month = booking.date.toISOString().slice(0, 7); // YYYY-MM
        performerRegistrationHistory[month] =
          (performerRegistrationHistory[month] || 0) + 1;
      }
  
      // Return the formatted report
      return {
        totalPrograms: totalPrograms || 0,
     
     
        upcomingEvent,
        eventHistory,
      };
    } catch (error: any) {
      console.error('Error fetching performer details:', error.message);
      throw new Error(`Error fetching performer details: ${error.message}`);
    }
  };
  

  getAllUsers = async (id: mongoose.Types.ObjectId): Promise<UserDocuments[] | null> => {
    try {
      const users = await UserModel.find({ _id: { $ne: id } });
      return users;
    } catch (error) {
      throw error;
    }
  };
  
  performerAllDetails = async (
    id: mongoose.Types.ObjectId
  ): Promise<performerAllDetails | null> => {
    try {
      // Fetch performer and performerDetails
      const performer = await UserModel.findById(id);
      if (!performer) throw new Error('Performer not found');
      
      const performerDetails = await PerformerModel.findOne({ userId: id });
      if (!performerDetails) throw new Error('Performer details not found');
  
      // Fetch total events booked by performer
      const total = await BookingModel.find({ userId: performerDetails?._id });
     
  
      // Calculate total events by performer
      const totalEvents = await BookingModel.find({ performerId: performerDetails._id }).countDocuments();
    
      // Calculate wallet details
      const userWallet = await WalletModel.find({ userId: id });
      // if (!userWallet || userWallet.length === 0) throw new Error('No wallet data found');
  
      const walletAmount = userWallet.reduce((total, wallet) => total + wallet.amount, 0);
      const walletTransactionHistory = userWallet.reduce(
        (history, wallet) => ({
          ...history,
          [wallet.date.toISOString()]: wallet.amount,
        }),
        {}
      );
    
      // Calculate total programs
      const totalPrograms = await EventModel.countDocuments({ userId: id });
    
      // Get upcoming events (group by month if event is only for one day)
      const upcomingEventsPipeline = [
        {
          $match: {
            performerId: performerDetails._id,
            bookingStatus: { $nin: ['canceled', 'completed'] }, // Exclude 'canceled' and 'completed'
          },
        },
        {
          $project: {
            formattedDate: { $dateToString: { format: '%Y-%m', date: '$date' } }, // Format date as 'Year-Month'
            count: 1,
          },
        },
        {
          $group: {
            _id: "$formattedDate", // Group by formatted date (month)
            count: { $sum: 1 }, // Count the number of events in each month
          },
        },
      ];
  
      const upcomingEventsResult = await BookingModel.aggregate(upcomingEventsPipeline);
      console.log('1000', upcomingEventsResult);
      
      const upcomingEvents = upcomingEventsResult.reduce(
        (events, item) => ({ ...events, [item._id]: item.count }),
        {}
      );
  
      // Calculate totalEventsHistory grouped by date
      const totalEventsHistoryPipeline = [
        { $match: { performerId: performerDetails._id, bookingStatus: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%d/%m/%Y', date: '$date' } }, // Use '%Y' for the year
            count: { $sum: 1 },
          },
        },
      ];
  
      const totalEventsHistoryResult = await BookingModel.aggregate(totalEventsHistoryPipeline);
      const totalEventsHistory = totalEventsHistoryResult.reduce(
        (history, item) => ({ ...history, [item._id]: item.count }),
        {}
      );
  
      // Return aggregated details
      return {
        walletAmount,
        walletTransactionHistory,
        totalEvent: totalEvents, // Assuming "totalEvent" is the total wallet entries
        totalPrograms,
        totalEventsHistory,
        upcomingEvents,
        totalReviews: performerDetails.totalReviews || 0, // Default value if not present
      };
  
    } catch (error: any) {
      console.error('Error fetching performer details:', error.message);
      // You can throw or return a custom error message if needed
      throw new Error(`Error fetching performer details: ${error.message}`);
    }
  };
  
  
  
  
  slotDetails = async (
    id: mongoose.Types.ObjectId
  ): Promise<SlotMangement | null> => {
    try {
      const performer = await PerformerModel.findOne({ userId: id });
  
      if (!performer) {
        throw new Error("Performer not found");
      }
  
      const performerId = performer._id;
  
      const performerSlot = await SlotModel.findOne({
        performerId: performerId,
      });
  
      // Fetch bookings irrespective of slot presence
      const bookingEvents = await BookingModel.find({
        performerId: performerId,
        bookingStatus: { $ne: "canceled" }, // Exclude canceled bookings
      });
  
      const bookingDates = bookingEvents.map((event) => event.date);
  
      let unavailableDates: Date[] = [];
  
      if (performerSlot) {
        // If performerSlot exists, filter unavailable dates
        unavailableDates = performerSlot.dates.filter(
          (date) =>
            !bookingDates.some(
              (bookingDate) => bookingDate.getTime() === date.getTime()
            )
        );
      }
  
      const slotManagement = {
        bookingDates: bookingDates,
        unavailableDates: unavailableDates,
      } as SlotMangement;
  
      return slotManagement;
    } catch (error) {
      console.error("Error fetching slot details:", error);
      throw error;
    }
  };
  
  updateslot = async (
    id: mongoose.Types.ObjectId,
    date: Date
  ): Promise<SlotDocuments | null | string> => {
    try {
      // Validate input
      if (!id || !date) {
        throw new Error("User ID and date are required");
      }

      // Find the performer by userId
      const performer = await PerformerModel.findOne({ userId: id });

      if (!performer) {
        throw new Error("Performer not found");
      }

      const performerId = performer._id;

      // Check for existing booking
 const existingBooking = await BookingModel.findOne({
  performerId,
  date: {
    $gte: new Date(date.setHours(0, 0, 0, 0)),
    $lt: new Date(date.setHours(23, 59, 59, 999)),
  },
  bookingStatus: { $ne: "canceled" }, // Ensure booking status is not "canceled"
});

      if (existingBooking) {
    
        return "Slot already booked for this date";
      }

      // Find or create slot document
      let slotDocument = await SlotModel.findOne({ performerId });

      if (!slotDocument) {
        slotDocument = new SlotModel({
          performerId,
          dates: [new Date(date.setHours(0, 0, 0, 0))],
        });
        return await slotDocument.save();
      }

      const normalizedDate = new Date(date.setHours(0, 0, 0, 0));

      const dateIndex = slotDocument.dates.findIndex(
        (existingDate) =>
          existingDate.toISOString().split("T")[0] ===
          normalizedDate.toISOString().split("T")[0]
      );

      if (dateIndex !== -1) {
        slotDocument.dates.splice(dateIndex, 1);
      } else {
        slotDocument.dates.push(normalizedDate);
      }

      return await slotDocument.save();
    } catch (error) {
      console.error("Error in updateSlot:", error);
      throw error;
    }
  };

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

  uploadedEvent = async (event: {
    imageUrl: string;
    id: string;
    title: string;
    category: string;
    userId: Types.ObjectId;
    price: number;
    teamLeader: string;
    teamLeaderNumber: string;
    description: string;
  }): Promise<EventDocument | null> => {
    try {
      // Insert the event into the database
      const events = await EventModel.insertMany([event]);
 

      // Return the first inserted event (if exists)
      return events.length > 0 ? events[0] : null;
    } catch (error) {
      // Log the error or handle it as necessary
      console.error("Error inserting event:", error);
      throw error; // re-throw the error for further handling if needed
    }
  };

  loginPerformer = async (
    email: string,
    password: string
  ): Promise<asPerformer | null | string> => {
    try {
      // Find the performer by email
      const performer = await UserModel.findOne({ email: email });


      if (!performer) {
        return null; // Performer not found
      } else if (performer.isPerformerBlocked) {
        return "Performer is Blocked"; // Performer is blocked
      } else if (!performer.isVerified) {
        return "Performer is not Verified"; // Performer is not verified
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, performer.password);
      if (!isMatch) {
        return null; // Passwords do not match
      }

      return {
        username: performer.username,
        email: performer.email,
        password: performer.password, // Consider omitting this for security reasons
        _id: performer._id?.toString(),
        isVerified: performer.isVerified,
        isPerformerBlocked: performer.isPerformerBlocked,
      };
    } catch (error) {
      throw error;
    }
  };

  getPerformerDetails = async (
    userId: Types.ObjectId
  ): Promise<PerformerDocuments | null> => {
    try {
      // Find performer by userId

      const performer = await PerformerModel.findOne({ userId }).lean().exec();

      if (!performer) throw new Error("Performer not found");

      return performer;
    } catch (error) {
      console.error("Error occurred while finding performer:", error);
      return null;
    }
  };

  videoUploadDB = async (
    bandName: string,
    mobileNumber: string,
    description: string,
    user_id: mongoose.Types.ObjectId,
    s3Location: any
  ): Promise<TempPerformerDocument | null> => {
    try {
   
      const user = await UserModel.findByIdAndUpdate(user_id, {
        waitingPermission: true,
      });

      // Create a new TempPerformer document
      const newTempPerformer = new TempPerformerModel({
        bandName: bandName,
        mobileNumber: mobileNumber,
        video: s3Location,
        description: description,
        user_id: user_id,
      });

      // Save the document to the database
      const savedTempPerformer = await newTempPerformer.save();

      return savedTempPerformer;
    } catch (error) {
      console.error("Error occurred while creating temp performer:", error);
      return null;
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
  ): Promise<EventDocument | null> => {
    try {
      // Use $set to only update the provided fields
      const updatedEvent = await EventModel.findByIdAndUpdate(
        eventId,
        { $set: event },
        { new: true } // Return the updated document
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
  ): Promise<UpcomingEventDocument[] | null> => {
    try {
      const currentDate = new Date();
      const performer = await PerformerModel.findOne({ userId: id }).lean();
      if (!performer) {
        throw new Error("Performer not found");
      }

      // Fetch bookings for the performer
      const bookings = await BookingModel.find({ performerId: performer._id, date: { $gte: currentDate } })
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .populate("userId", "name") 
        .lean();

  
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

      return upcomingEvents;
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
      console.log("Date difference (days):", dateDifferenceInDays);


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
  getAlleventHistory = async (
    id: mongoose.Types.ObjectId
  ): Promise<UpcomingEventDocument[] | null> => {
    try {
      const currentDate = new Date();
      const performer = await PerformerModel.findOne({ userId: id }).lean();
      if (!performer) {
        throw new Error("Performer not found");
      }
  
   
      const bookings = await BookingModel.find({ performerId: performer._id, date: { $lt: currentDate }})
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
  
      return eventHistory;
    } catch (error) {
      console.error("Error in getAlleventHistory:", error);
      throw error;
    }
  };
  changeEventStatus = async (): Promise<BookingDocument[] | null> => {
    try {
      console.log('1')
      const events = await BookingModel.find({
        date: { $lt: new Date() },
        bookingStatus: { $ne: 'canceled' }
      });
      console.log('11',events)
  
      if (events.length === 0) {
        return null;
      }
  
      const updatedEvents = await Promise.all(
        events.map(async (event) => {
          event.bookingStatus = 'completed';
          return await event.save();
        })
      );
  
      return updatedEvents;
    } catch (error) {
      throw error;
    }
  };
}
