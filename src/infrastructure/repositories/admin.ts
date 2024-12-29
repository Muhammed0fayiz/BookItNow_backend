import { TempPerformerDocument } from "./../models/tempPerformer";

import { IadminRepository } from "../../application/interfaces/IadminRepository";
import { User, UserDocument } from "../../domain/entities/user";
import { OtpUser } from "../../domain/entities/otpUser";

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
      if (createdAt && createdAt >= startDate && createdAt < adjustedEndDate) {
        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
        performerRegistrationHistory[day] = (performerRegistrationHistory[day] || 0) + 1;
      }
    });

 
    const userRegistrationHistory: Record<string, number> = {};
    users.forEach(({ createdAt }) => {
      if (createdAt && createdAt >= startDate && createdAt < adjustedEndDate) {
        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
        userRegistrationHistory[day] = (userRegistrationHistory[day] || 0) + 1;
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
    console.error('Error fetching report details:', error);
    throw error;
  }
};

  adminWallet(): Promise<AdminDocument[] | null> {
    throw new Error("Method not implemented.");
  }



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
      const performers = await PerformerModel.find();

      return performers;
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
        mobileNumber:tempPerform.mobileNumber,
        description: tempPerform.description,

        rating: 0, 
      });

   
      await TempPerformerModel.findByIdAndDelete(id);


      return newPerformer;
    } catch (error) {
     
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
      const users = await UserModel.find().lean(); 


      return users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })) as unknown as UserDocument[];
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; 
    }
  };


  getAllTempPerformers = async (): Promise<any[]> => {
    try {
      const tempPerformers = await TempPerformerModel.find().lean(); 

      return tempPerformers.map((performer) => ({
        ...performer,
        _id: performer._id.toString(),
      })) as any[]; 
    } catch (error) {
      console.error("Error fetching temp performers:", error);
      return []; 
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

      

      const admin = await AdminModel.findOne(); 
  
      let walletAmount = 0; 
      let walletTransactionHistory: Record<string, number> = {}; 
  
      if (admin) {
        walletAmount = admin.walletAmount; 
        walletTransactionHistory = admin.transactions; 
      }
  
    
      const performers = await PerformerModel.find().populate('userId', 'createdAt');
      const users = await UserModel.find();

      const performerRegistrationHistory: Record<string, number> = {};
      performers.forEach((performer) => {
        if (performer.userId && (performer.userId as any).createdAt) {
          const createdAt = (performer.userId as any).createdAt;
         
          const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
          performerRegistrationHistory[day] = (performerRegistrationHistory[day] || 0) + 1;
        }
      });

    
      const userRegistrationHistory: Record<string, number> = {};
      users.forEach(({ createdAt }) => {
        if (createdAt) {
          
          const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
          userRegistrationHistory[day] = (userRegistrationHistory[day] || 0) + 1;
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
      console.error('Error fetching admin details:', error);
      throw error;
    }
  };
  
  
  
}
