import { PerformerDocuments, PerformerModel } from './../models/performerModel';
import { TempPerformerDocument } from "./../models/tempPerformer";

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
export class performerRepository implements IperformerRepository {

    loginPerformer = async (email: string, password: string): Promise<asPerformer | null> => {
        try {
          const performer = await UserModel.findOne({ email: email });
          console.log('performer is ok',performer)
      
          if (!performer || performer.isPerformerBlocked || !performer.isVerified) {
            // Return null if the performer doesn't exist, is blocked, or is not verified
            return null;
          }
      
          const isMatch = await bcrypt.compare(password, performer.password); // Compare hashed passwords
      
          if (!isMatch) {
            return null;
          }
      
          return {
            username: performer.username,
            email: performer.email,
            password: performer.password,
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
    };
    
}
