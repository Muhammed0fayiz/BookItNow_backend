import { TempPerformerDocument } from "../../models/tempPerformer";

import { IadminRepository } from "../../../application/interfaces/admin/IadminRepository";
import { User, UserDocument } from "../../../domain/entities/user";
import { OtpUser } from "../../../domain/entities/otpUser";

import { UserDocuments, UserModel } from "../../models/userModel";

import bcrypt from "bcrypt";

import { TempPerformerModel } from "../../models/tempPerformer";
import { TempPerformer } from "../../../domain/entities/tempPerformer";
import { generateOTP } from "../../../shared/utils/generateOtp";
import { tempUserModel } from "../../models/tempUser";
import { Types } from "mongoose";
import { Performer } from "../../../domain/entities/performer";
import { PerformerModel } from "../../models/performerModel";
import { EventDocument, EventModel } from "../../models/eventsModel";
import { AdminDocument, AdminModel } from "../../models/adminModel";
import { AdminDetails } from "../../../domain/entities/adminDetails";
import { AdminRevenue } from "../../../domain/entities/adminRevenue";
import { BookingModel } from "../../models/bookingEvents";
export class adminRepository implements IadminRepository {
  getRevenue = async (
    offset: number,
    pageSize: number
  ): Promise<{ totalCount: number; adminRevinue: AdminRevenue[] } | null> => {
    try {
      const bookings = await BookingModel.find()
        .skip(offset)
        .limit(pageSize)
        .sort({ _id: -1 }) 
        .populate('eventId');
  
      const totalCount = await BookingModel.countDocuments();
  
      const adminRevinue: AdminRevenue[] = [];
  
      for (const booking of bookings) {
        const performer = await PerformerModel.findById(booking.performerId);
      
        const user = await UserModel.findById(booking.userId);
  
        if (user && performer && booking.eventId) {
          adminRevinue.push({
            userName: user.username,
            performerName: performer.bandName, // performer username
            eventName: (booking.eventId as any).title,
            status: booking.bookingStatus,
            place: booking.place,
            date: booking.createdAt.toISOString(),
          });
        }
      }
  
      return {
        totalCount,
        adminRevinue,
      };
    } catch (error) {
      throw error;
    }
  };
  
  



  getAdminDetails = async (): Promise<AdminDetails> => {
    try {
      const admin = await AdminModel.findOne();

      let walletAmount = 0;
      let walletTransactionHistory: Record<string, number> = {};

      if (admin) {
        walletAmount = admin.walletAmount;
        walletTransactionHistory = admin.transactions;
      }

      const performers = await PerformerModel.find().populate(
        "userId",
        "createdAt"
      );
      const users = await UserModel.find();

      const performerRegistrationHistory: Record<string, number> = {};
      performers.forEach((performer) => {
        if (performer.userId && (performer.userId as any).createdAt) {
          const createdAt = (performer.userId as any).createdAt;

          const day = `${createdAt.getFullYear()}-${String(
            createdAt.getMonth() + 1
          ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
          performerRegistrationHistory[day] =
            (performerRegistrationHistory[day] || 0) + 1;
        }
      });

      const userRegistrationHistory: Record<string, number> = {};
      users.forEach(({ createdAt }) => {
        if (createdAt) {
          const day = `${createdAt.getFullYear()}-${String(
            createdAt.getMonth() + 1
          ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
          userRegistrationHistory[day] =
            (userRegistrationHistory[day] || 0) + 1;
        }
      });

      return {
        walletAmount: walletAmount,
        walletTransactionHistory: walletTransactionHistory,
        totalUsers: users.length,
        totalPerformers: performers.length,
        userRegistrationHistory: userRegistrationHistory,
        performerRegistrationHistory: performerRegistrationHistory,
      };
    } catch (error) {
      console.error("Error fetching admin details:", error);
      throw error;
    }
  };
  getReport = async (startDate: Date, endDate: Date): Promise<AdminDetails> => {
    try {
      console.log("Fetching report for date range...", startDate, endDate);

      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

      const admin = await AdminModel.findOne();

      let walletAmount = 0;
      let walletTransactionHistory: Record<string, number> = {};

      if (admin) {
        walletAmount = admin.walletAmount;
        walletTransactionHistory = admin.transactions;
      }

      const performers = await PerformerModel.find({
        createdAt: { $gte: startDate, $lt: adjustedEndDate },
      });

      const users = await UserModel.find({
        createdAt: { $gte: startDate, $lt: adjustedEndDate },
      });

      const performerRegistrationHistory: Record<string, number> = {};
      performers.forEach(({ createdAt }) => {
        if (
          createdAt &&
          createdAt >= startDate &&
          createdAt < adjustedEndDate
        ) {
          const day = `${createdAt.getFullYear()}-${String(
            createdAt.getMonth() + 1
          ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
          performerRegistrationHistory[day] =
            (performerRegistrationHistory[day] || 0) + 1;
        }
      });

      const userRegistrationHistory: Record<string, number> = {};
      users.forEach(({ createdAt }) => {
        if (
          createdAt &&
          createdAt >= startDate &&
          createdAt < adjustedEndDate
        ) {
          const day = `${createdAt.getFullYear()}-${String(
            createdAt.getMonth() + 1
          ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
          userRegistrationHistory[day] =
            (userRegistrationHistory[day] || 0) + 1;
        }
      });

      return {
        walletAmount: walletAmount,
        walletTransactionHistory: walletTransactionHistory,
        totalUsers: users.length,
        totalPerformers: performers.length,
        userRegistrationHistory: userRegistrationHistory,
        performerRegistrationHistory: performerRegistrationHistory,
      };
    } catch (error) {
      console.error("Error fetching report details:", error);
      throw error;
    }
  };

  adminWallet(): Promise<AdminDocument[] | null> {
    throw new Error("Method not implemented.");
  }


  getTempPerformer = async (): Promise<TempPerformerDocument[] | null> => {
    try {
      const tmp = await TempPerformerModel.find().sort({ _id: -1 });
      if (tmp) {
        return tmp;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  grantedPermission = async (id: string): Promise<any> => {
    try {
      const tempPerform = await TempPerformerModel.findById(id);

      if (!tempPerform) {
        throw new Error("Temporary performer not found");
      }

      const user = await UserModel.findByIdAndUpdate(
        tempPerform.user_id,
        { isVerified: true, waitingPermission: false },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      const newPerformer = await PerformerModel.create({
        userId: user._id,
        bandName: tempPerform.bandName,
        mobileNumber: tempPerform.mobileNumber,
        description: tempPerform.description,

        rating: 0,
      });

      await TempPerformerModel.findByIdAndDelete(id);

      return newPerformer;
    } catch (error) {
      throw error;
    }
  };
  rejectedPermission = async (id: string): Promise<TempPerformer> => {
    try {
      const tempPerform = (await TempPerformerModel.findByIdAndDelete(
        id
      )) as TempPerformer;

      if (!tempPerform) {
        throw new Error("Performer not found");
      }

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
      const performers = await PerformerModel.find().sort({ _id: -1 });;

      return performers;
    } catch (error) {
      throw error;
    }
  };
  performerStatusChange = async (id: string): Promise<UserDocument> => {
    try {
      const performer = await UserModel.findById(id).lean().exec();

      if (!performer) {
        throw new Error("User not found");
      }

      const updatedIsPerformerBlocked = !performer.isPerformerBlocked;

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

      return updatedUser as unknown as UserDocument;
    } catch (error) {
      console.error("Error in performerStatusChange:", error);
      throw error;
    }
  };


  getAllUser = async (): Promise<UserDocument[]> => {
    try {
      const users = await UserModel.find().sort({ _id: -1 }).lean();


      return users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })) as unknown as UserDocument[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
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


 


  getAllEvents = async (): Promise<EventDocument[] | null> => {
    try {
      const allEvents = await EventModel.find().sort({ _id: -1 });
      return allEvents;
    } catch (error) {
      console.error("Error fetching events:", error);
      return null;
    }
  };

  toggleBlockStatus = async (
    id: string,
    blockingDetails?: { reason: string; duration: string }
  ): Promise<EventDocument | null> => {
    try {
      const event = await EventModel.findById(id);
      if (!event) return null;
  
      event.isblocked = !event.isblocked;
  
      if (event.isblocked && blockingDetails) {
        const { reason, duration } = blockingDetails;
        const blockingEndDate = new Date();
  
        switch (duration) {
          case '1week':
            blockingEndDate.setDate(blockingEndDate.getDate() + 7);
            break;
          case '1month':
            blockingEndDate.setMonth(blockingEndDate.getMonth() + 1);
            break;
          case '1year':
            blockingEndDate.setFullYear(blockingEndDate.getFullYear() + 1);
            break;
          case '10year':
            blockingEndDate.setFullYear(blockingEndDate.getFullYear() + 10);
            break;
          default:
            throw new Error('Invalid blocking duration');
        }
  
        event.blockingReason = reason;
        event.blockingPeriod = blockingEndDate;
      } else {
        event.blockingReason = "";
        event.blockingPeriod = null;
      }
  
      const updatedEvent = await event.save();
      return updatedEvent;
    } catch (error) {
      console.error("Error toggling block status:", error);
      throw error;
    }
  };
  

  }

  



