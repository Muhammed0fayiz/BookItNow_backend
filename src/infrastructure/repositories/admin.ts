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
import{tempUserModel} from "../models/tempUser";
import { Types } from "mongoose";
import { Performer } from "../../domain/entities/performer";
import { PerformerModel } from "../models/performerModel";
export class adminRepository implements IadminRepository {
  rejectedPermission = async (id: string): Promise<TempPerformer> => {
    try {
    
  
      // Find the performer by ID and delete
      const tempPerform = await TempPerformerModel.findByIdAndDelete(id) as TempPerformer;
  
      // Handle the case where no performer is found
      if (!tempPerform) {
        throw new Error('Performer not found');
      }
  
      // Update the user document associated with the deleted performer
      await UserModel.findByIdAndUpdate(tempPerform.user_id, { waitingPermission: false });
  
      return tempPerform;
    } catch (error) {
      throw error;
    }
  };
  
  
  
 
  getAllPerformer=async(): Promise<Performer[] | null>=> {
try {
 
      const performers=await PerformerModel.find()

      return performers
} catch (error) {
  throw error
}
  }

  grantedPermission = async (id: string): Promise<Performer> => {
    try {
      // Fetch the temporary performer details

      const tempPerform = await TempPerformerModel.findById(id);
   
      
      if (!tempPerform) {
        throw new Error('Temporary performer not found');
      }
  
      // Update the user to set `isVerified: true`
      const user = await UserModel.findByIdAndUpdate(tempPerform.user_id, { isVerified: true,waitingPermission:false }, { new: true });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Create a new performer entry using data from the temp performer
      const newPerformer = await PerformerModel.create({
        userId: user._id,
        bandName: tempPerform.bandName,
        description: tempPerform.description,
        place: tempPerform.place,
        rating: 0 // Set the initial rating to 0
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
  
  
  
 
 
  
  
  getTempPerformer=async(): Promise<TempPerformerDocument[] | null> =>{
   try {
     const tmp=await TempPerformerModel.find()
     if(tmp){
      return tmp
     }
     return null
   } catch (error) {
    throw error
   }
  }


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
      console.log('use case performer', id);
      const performer = await UserModel.findById(id).lean().exec();
  
      if (!performer) {
        throw new Error("User not found");
      }
  
      console.log('before update', performer);
  
      // Toggle the correct property
      const updatedIsPerformerBlocked = !performer.isPerformerBlocked;
      console.log(updatedIsPerformerBlocked, 'is performer blocked');
  
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
  
      console.log('after update', updatedUser);
  
      return updatedUser as unknown as UserDocument;
    } catch (error) {
      console.error('Error in performerStatusChange:', error);
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
  getAllTempPerformers = async (): Promise<TempPerformer[]> => {
    try {
      const tempPerformers = await TempPerformerModel.find().lean(); // Use .lean() for better performance

      // Map the results and ensure proper typing for _id
      return tempPerformers.map((performer) => ({
        ...performer,
        _id: performer._id.toString(), // Convert ObjectId to string
      })) as TempPerformer[]; // Cast directly to TempPerformer[]
    } catch (error) {
      console.error("Error fetching temp performers:", error);
      return []; // Return an empty array in case of an error
    }
  };
}
