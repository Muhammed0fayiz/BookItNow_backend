import { SlotDocuments, SlotModel } from './../models/slotModel';
 import { PerformerDocuments, PerformerModel } from './../models/performerModel';
import { TempPerformerDocument } from "./../models/tempPerformer";
import mongoose from 'mongoose';
import { IperformerRepository } from "../../application/interfaces/IperformerRepository";
import { User, UserDocument } from "../../domain/entities/user";
import { OtpUser } from "../../domain/entities/otpUser";
// import { OtpDocument, OtpModel } from "../models/otpSession";
import { UserDocuments, UserModel } from "../models/userModel";


import bcrypt from "bcrypt";

import { TempPerformerModel } from "../models/tempPerformer";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { generateOTP } from "../../shared/utils/generateOtp";
import{tempUserModel} from "../models/tempUser";
import { asPerformer } from "../../domain/entities/asPerformer";
import { Types } from "mongoose";
import { performerDocument } from "../../domain/entities/performer";
import { EventDocument, EventModel } from '../models/eventsModel';
import { UpcomingEventDocument } from '../../domain/entities/upcomingevent';
import { BookingDocument, BookingModel } from '../models/bookingEvents';
import { WalletModel } from '../models/walletHistory';
import { SlotMangement } from '../../domain/entities/slot';
export class performerRepository implements IperformerRepository {
  slotDetails = async (id: mongoose.Types.ObjectId): Promise<SlotMangement | null> => {
    try {
    
    
      const performer = await PerformerModel.findOne({userId:id});
      
      if (!performer) {
        throw new Error("Performer not found");
      }
  
      const performerId = performer._id;
      const performerSlot = await SlotModel.findOne({ performerId: performerId });
      
      if (!performerSlot) {
        return null;
      }

   
      const bookingEvents = await BookingModel.find({ performerId: performerId });
      
  
      const bookingDates = bookingEvents.map(event => event.date);
 
      const unavailableDates = performerSlot.dates.filter(date => 
        !bookingDates.some(bookingDate => 
          bookingDate.getTime() === date.getTime()
        )
      );

     
      const slotManagement = {
        bookingDates: bookingDates,
        unavailableDates: unavailableDates
      } as SlotMangement;

      return slotManagement;
    } catch (error) {
      console.error('Error fetching slot details:', error);
      throw error;
    }
  };
  
  updateslot = async (id: mongoose.Types.ObjectId, date: Date): Promise<SlotDocuments | null> => {
    try {
      const userId = id;
      const slotDate = date;
  
      
      const performer = await PerformerModel.findOne({ userId });
  
      if (!performer) {
        throw new Error("Performer not found");
      }
  
      const performerId = performer._id;
  
      
      let slotDocument = await SlotModel.findOne({ performerId });
  
      if (!slotDocument) {
       
        slotDocument = new SlotModel({ performerId, dates: [slotDate] });
        await slotDocument.save();
        return slotDocument;
      }
  
   
      const dateIndex = slotDocument.dates.findIndex(existingDate => existingDate.getTime() === slotDate.getTime());
  
      if (dateIndex !== -1) {
     
        slotDocument.dates.splice(dateIndex, 1);
      } else {
 
        slotDocument.dates.push(slotDate);
      }
  
     
      await slotDocument.save();
  
      return slotDocument;
    } catch (error) {
      throw error;
    }
  };
  
  
 
  deleteEvent=async(id: string): Promise<EventDocument | null>=> {
    try {
     const deleteEvent=await EventModel.findByIdAndDelete(id)
     return deleteEvent
    } catch (error) {
      throw error
      
    }
  }
  getPerformerEvents=async(id: string): Promise<EventDocument[] | null>=> {
    try {
      const performerAllEvents=await EventModel.find({userId:id})
    
      return performerAllEvents
    } catch (error) {
      throw error
    }
  }

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
    console.log(events)
    
    // Return the first inserted event (if exists)
    return events.length > 0 ? events[0] : null;
  } catch (error) {
    // Log the error or handle it as necessary
    console.error("Error inserting event:", error);
    throw error; // re-throw the error for further handling if needed
  }
};



  loginPerformer = async (email: string, password: string): Promise<asPerformer | null | string> => {
    try {
      // Find the performer by email
      const performer = await UserModel.findOne({ email: email });
      console.log('performer is ok', performer);
  

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
  

      getPerformerDetails = async (userId: Types.ObjectId): Promise<PerformerDocuments | null> => {
        try {
            // Find performer by userId
         
            const performer = await PerformerModel.findOne({ userId }).lean().exec();
          
            if (!performer) throw new Error("Performer not found");
          
            return performer;
        } catch (error) {
            console.error("Error occurred while finding performer:", error);
            return null;
        }
    }
 
  //     try {
  //         console.log("values", val);
  //         console.log("location", location);
  
  //         // Create a new TempPerformer document
  //         const newTempPerformer = new TempPerformerModel({
  //             bandName: val.bandName,
  //             mobileNumber: val.mobileNumber,
  //             video: location,
  //             description: val.description,
  //             user_id: new mongoose.Types.ObjectId(val.user_id)
  //         });
  
  //         // Save the document to the database
  //         const savedTempPerformer = await newTempPerformer.save();
  
  //         return savedTempPerformer;
  //     } catch (error) {
  //         console.error("Error occurred while creating temp performer:", error);
  //         return null;
  //     }
  // };
    




  videoUploadDB=async(bandName: string, mobileNumber: string, description: string, user_id: mongoose.Types.ObjectId,  s3Location: any): Promise<TempPerformerDocument | null> =>{
    try {
         console.log('sssssssss',mobileNumber,description,user_id,s3Location,'user id',user_id)
              console.log("location", s3Location);
              const user = await UserModel.findByIdAndUpdate(user_id, { waitingPermission: true });
     
              // Create a new TempPerformer document
              const newTempPerformer = new TempPerformerModel({
                  bandName: bandName,
                  mobileNumber: mobileNumber,
                  video: s3Location,
                  description:description,
                  user_id: user_id
              });

      
              // Save the document to the database
              const savedTempPerformer = await newTempPerformer.save();

          
      
              return savedTempPerformer;
          } catch (error) {
              console.error("Error occurred while creating temp performer:", error);
              return null;
          }
  }


editEvents=async(eventId: string, event: { imageUrl?: string; title: string; category: string; userId: Types.ObjectId; price: number; teamLeader: string; teamLeaderNumber: number; description: string; }): Promise<EventDocument | null>=> {
  try {
    // Use $set to only update the provided fields
    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { $set: event},
      { new: true } // Return the updated document
    );

    return updatedEvent;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}
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
      // Fetch the performer based on the user ID
      const performer = await PerformerModel.findOne({ userId: id }).lean();
      if (!performer) {
        throw new Error("Performer not found");
      }
  
      // Fetch bookings for the performer
      const bookings = await BookingModel.find({ performerId: performer._id })
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .populate("userId", "name") // Add population for userId to get user name
        .lean();
  
      // Map bookings to the desired structure
      const upcomingEvents: UpcomingEventDocument[] = await Promise.all(
        bookings.map(async (booking) => {
          const event = booking.eventId as any;
          const user = booking.userId as any; // Type assertion for user
  
          return {
            _id: booking._id,
            eventId: booking.eventId,
            performerId: booking.performerId,
            userId: booking.userId,
            username: user.name, // Add username from populated user
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
      console.log("Cancel event initiated");
  
      const today = new Date();
      const event = await BookingModel.findById(id);
  
      // Check if the event exists
      if (!event) {
        console.log("Booking not found");
        return null;
      }
  
      const dateDifferenceInDays = Math.floor(
        (event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log("Date difference (days):", dateDifferenceInDays);
  
      // Return null if the event is less than 5 days away
      if (dateDifferenceInDays < 5) {
        console.log("Cannot cancel events less than 5 days away.");
        return null;
      }
  
      const { userId, advancePayment } = event;
  
      // Validate if the event has an associated user
      if (!userId) {
        console.log("No user associated with this event");
        return null;
      }
  
      // Refund to user's wallet
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { walletBalance: advancePayment },
      });
  
      // Log the wallet transaction
      const walletEntry = new WalletModel({
        userId,
        amount: advancePayment,
        transactionType: "credit",
        role: "user",
        date: today,
        description: "Event booking cancelled",
      });
      await walletEntry.save();
  
      // Update the booking status to canceled
      event.bookingStatus = "canceled";
      const updatedEvent = await event.save();
  
      return updatedEvent;
    } catch (error) {
      console.error("Error canceling event:", error);
      throw error;
    }
  };
  
  
}
