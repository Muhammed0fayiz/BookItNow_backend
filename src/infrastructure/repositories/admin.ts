import { TempPerformerDocument } from "./../models/tempPerformer";

import { IadminRepository } from "../../application/interfaces/IadminRepository";
import { User, UserDocument } from "../../domain/entities/user";
import { OtpUser } from "../../domain/entities/otpUser";
// import { OtpDocument, OtpModel } from "../models/otpSession";
import { UserDocuments, UserModel } from "../models/userModel";

import bcrypt from "bcrypt";

import { TempPerformerModel } from "../models/tempPerformer";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { generateOTP } from "../../shared/utils/generateOtp";
import { tempUserModel } from "../models/tempUser";
import { Types } from "mongoose";
import { Performer } from "../../domain/entities/performer";
import { PerformerModel } from "../models/performerModel";
import { EventDocument, EventModel } from "../models/eventsModel";
import { AdminDocument, AdminModel } from "../models/adminModel";
import { AdminDetails } from "../../domain/entities/adminDetails";
export class adminRepository implements IadminRepository {
getReport = async (startDate: Date, endDate: Date): Promise<AdminDetails> => {
  try {
    console.log('Fetching report for date range...', startDate, endDate);
    
    // Adjust endDate to include the entire end day (endDate + 1)
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Add 1 day to include the full end date

    // Fetch admin data (assuming there is only one admin record)
    const admin = await AdminModel.findOne();

    let walletAmount = 0;
    let walletTransactionHistory: Record<string, number> = {};

    if (admin) {
      walletAmount = admin.walletAmount;
      walletTransactionHistory = admin.transactions;
    }
 

    // Fetch performers and users within the date range
    const performers = await PerformerModel.find({
      createdAt: { $gte: startDate, $lt: adjustedEndDate },
    });
console.log('elerj',performers)
    const users = await UserModel.find({
      createdAt: { $gte: startDate, $lt: adjustedEndDate },
    });

    // Calculate performer registration history by day within the date range
    const performerRegistrationHistory: Record<string, number> = {};
    performers.forEach(({ createdAt }) => {
      if (createdAt && createdAt >= startDate && createdAt < adjustedEndDate) {
        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
        performerRegistrationHistory[day] = (performerRegistrationHistory[day] || 0) + 1;
      }
    });

    // Calculate user registration history by day within the date range
    const userRegistrationHistory: Record<string, number> = {};
    users.forEach(({ createdAt }) => {
      if (createdAt && createdAt >= startDate && createdAt < adjustedEndDate) {
        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
        userRegistrationHistory[day] = (userRegistrationHistory[day] || 0) + 1;
      }
    });

    // Return the report with the data filtered by the date range
    return {
      walletAmount: walletAmount,
      walletTransactionHistory: walletTransactionHistory,
      totalUsers: users.length,
      totalPerformers: performers.length,
      userRegistrationHistory: userRegistrationHistory,
      performerRegistrationHistory: performerRegistrationHistory,
    };
  } catch (error) {
    console.error('Error fetching report details:', error);
    throw error;
  }
};

  adminWallet(): Promise<AdminDocument[] | null> {
    throw new Error("Method not implemented.");
  }



  rejectedPermission = async (id: string): Promise<TempPerformer> => {
    try {
      // Find the performer by ID and delete
      const tempPerform = (await TempPerformerModel.findByIdAndDelete(
        id
      )) as TempPerformer;

      // Handle the case where no performer is found
      if (!tempPerform) {
        throw new Error("Performer not found");
      }

      // Update the user document associated with the deleted performer
      await UserModel.findByIdAndUpdate(tempPerform.user_id, {
        waitingPermission: false,
      });

      return tempPerform;
    } catch (error) {
      throw error;
    }
  };

  getAllPerformer = async (): Promise<Performer[] | null> => {
    try {
      const performers = await PerformerModel.find();

      return performers;
    } catch (error) {
      throw error;
    }
  };

  grantedPermission = async (id: string): Promise<any> => {
    try {
      // Fetch the temporary performer details

      const tempPerform = await TempPerformerModel.findById(id);

      if (!tempPerform) {
        throw new Error("Temporary performer not found");
      }

      // Update the user to set `isVerified: true`
      const user = await UserModel.findByIdAndUpdate(
        tempPerform.user_id,
        { isVerified: true, waitingPermission: false },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Create a new performer entry using data from the temp performer
      const newPerformer = await PerformerModel.create({
        userId: user._id,
        bandName: tempPerform.bandName,
        mobileNumber:tempPerform.mobileNumber,
        description: tempPerform.description,

        rating: 0, // Set the initial rating to 0
      });

      // Delete the temporary performer
      await TempPerformerModel.findByIdAndDelete(id);

      // Return the new performer
      return newPerformer;
    } catch (error) {
      // Handle any errors that occurred during the process
      throw error;
    }
  };

  getTempPerformer = async (): Promise<TempPerformerDocument[] | null> => {
    try {
      const tmp = await TempPerformerModel.find();
      if (tmp) {
        return tmp;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  userStatusChange = async (id: string): Promise<UserDocument> => {
    try {
      const user = (await UserModel.findById(
        id
      ).exec()) as unknown as UserDocument;

      if (!user) {
        throw new Error("User not found");
      }

      user.isblocked = !user.isblocked;

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { isblocked: user.isblocked },
        { new: true }
      )
        .lean()
        .exec();

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser as unknown as UserDocument;
    } catch (error) {
      throw error;
    }
  };

  performerStatusChange = async (id: string): Promise<UserDocument> => {
    try {
      console.log("use case performer", id);
      const performer = await UserModel.findById(id).lean().exec();

      if (!performer) {
        throw new Error("User not found");
      }

      console.log("before update", performer);

      // Toggle the correct property
      const updatedIsPerformerBlocked = !performer.isPerformerBlocked;
      console.log(updatedIsPerformerBlocked, "is performer blocked");

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { isPerformerBlocked: updatedIsPerformerBlocked },
        { new: true }
      )
        .lean()
        .exec();

      if (!updatedUser) {
        throw new Error("User not found after update");
      }

      console.log("after update", updatedUser);

      return updatedUser as unknown as UserDocument;
    } catch (error) {
      console.error("Error in performerStatusChange:", error);
      throw error;
    }
  };
  getAllUser = async (): Promise<UserDocument[]> => {
    try {
      const users = await UserModel.find().lean(); // Use .lean() for better performance

      // Map the results to ensure that _id is converted to a string
      return users.map((user) => ({
        ...user,
        _id: user._id.toString(), // Convert ObjectId to string
      })) as unknown as UserDocument[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; // Return an empty array in case of an error
    }
  };

  // Inside your repository class
  getAllTempPerformers = async (): Promise<any[]> => {
    try {
      const tempPerformers = await TempPerformerModel.find().lean(); // Use .lean() for better performance

      // Map the results and ensure proper typing for _id
      return tempPerformers.map((performer) => ({
        ...performer,
        _id: performer._id.toString(), // Convert ObjectId to string
      })) as any[]; // Cast directly to TempPerformer[]
    } catch (error) {
      console.error("Error fetching temp performers:", error);
      return []; // Return an empty array in case of an error
    }
  };
  getAllEvents = async (): Promise<EventDocument[] | null> => {
    try {
      const allEvents = await EventModel.find();
      return allEvents;
    } catch (error) {
      console.error("Error fetching events:", error);
      return null;
    }
  };
 toggleBlockStatus = async (id: string): Promise<EventDocument | null> => {
    try {
      const event = await EventModel.findById(id);
      if (!event) return null;
      event.isblocked = !event.isblocked;
      const updatedEvent = await event.save();
      return updatedEvent;
    } catch (error) {
      throw error;
    }
  };

  getAdminDetails = async (): Promise<AdminDetails> => {
    try {
      console.log('Fetching admin details...');
      
      // Fetch admin data
      const admin = await AdminModel.findOne(); // Assuming there's only one admin record
  
      let walletAmount = 0; // Default value
      let walletTransactionHistory: Record<string, number> = {}; // Default empty history
  
      if (admin) {
        walletAmount = admin.walletAmount; // Access wallet amount
        walletTransactionHistory = admin.transactions; // Directly use transactions
      }
  
      // Fetch performers and users
      const performers = await PerformerModel.find().populate('userId', 'createdAt');
      const users = await UserModel.find();
  
      // Calculate performer registration history by day
      const performerRegistrationHistory: Record<string, number> = {};
      performers.forEach((performer) => {
        if (performer.userId && (performer.userId as any).createdAt) {
          const createdAt = (performer.userId as any).createdAt;
          // Extract year, month, and day from the createdAt date
          const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
          performerRegistrationHistory[day] = (performerRegistrationHistory[day] || 0) + 1;
        }
      });

    
      const userRegistrationHistory: Record<string, number> = {};
      users.forEach(({ createdAt }) => {
        if (createdAt) {
          // Extract year, month, and day from the createdAt date
          const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
          userRegistrationHistory[day] = (userRegistrationHistory[day] || 0) + 1;
        }
      });
  
      // Return the data with the fetched values
      return {
        walletAmount: walletAmount,
        walletTransactionHistory: walletTransactionHistory,
        totalUsers: users.length,
        totalPerformers: performers.length, // Total number of performers
        userRegistrationHistory: userRegistrationHistory,
        performerRegistrationHistory: performerRegistrationHistory, // Daily performer registrations
      };
    } catch (error) {
      console.error('Error fetching admin details:', error);
      throw error;
    }
  };
  
  
  
}
