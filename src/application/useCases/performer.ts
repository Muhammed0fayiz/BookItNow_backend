import { OtpUser } from "../../domain/entities/otpUser";
// import { OtpModel } from "../../infrastructure/models/otpSession";
import { UserModel } from "../../infrastructure/models/userModel";
import { checkOtp } from "../../domain/entities/checkOtp";
import {
  TempPerformerDocument,
  TempPerformer,
} from "../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../infrastructure/models/tempPerformer";

import { IperformerUseCase } from "../interfaces/IperformerUseCase";
import { IperformerRepository } from "../interfaces/IperformerRepository";
import { asPerformer } from "../../domain/entities/asPerformer";
import jwt from "jsonwebtoken";
import { uploadS3Video } from "../../infrastructure/s3/S3Video";
import mongoose, { Types } from "mongoose";
import { EventDocument, EventModel } from "../../infrastructure/models/eventsModel";
export class performerUseCase implements IperformerUseCase {
  private _repository: IperformerRepository;

  constructor(private repository: IperformerRepository) {
    this._repository = repository;
  }
  deleteEvent(id: string): Promise<EventDocument | null> {
    try {
     return this._repository.deleteEvent(id)
    } catch (error) {
      throw error
    }
  }
  getPerformerEvents=async(id: string): Promise<EventDocument[] | null> =>{
    try {
     const performerEvents= await this._repository.getPerformerEvents(id)
   console.log('per',performerEvents)
     return performerEvents
    } catch (error) {
      throw error
    }
  }
 
 

  // resendOtp(email: string): Promise<OtpUser> {
  //   throw new Error("Method not implemented.");
  // }


  loginPerformer = async (
    email: string,
    password: string
  ): Promise<asPerformer | null|string> => {
    try {
      return await this.repository.loginPerformer(email, password);
    } catch (error) {
      throw error;
    }
  };
  jwt = async (payload: asPerformer): Promise<string | null> => {
    try {
      // Create the JWT with the user ID included in the payload
      const token = jwt.sign(
        {
          id: payload._id,
          username: payload.username,
          email: payload.email,
          role: "performer",
        },
        "loginsecrit",
        { expiresIn: "2h" }
      );

      if (token) {
        return token;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  getPerformerDetails = async (id: any) => {
    try {
      console.log("performer details");
      console.log("user performe", id);

      // Use the updated repository method
      const response = await this._repository.getPerformerDetails(id);

      return response ? response : null;
    } catch (error) {
      console.error("error occurred");

      return null;
    }
  };

  videoUpload = async (
    bandName: string,
    mobileNumber: string,
    description: string,
    user_id: mongoose.Types.ObjectId,
    video: any
  ): Promise<TempPerformerDocument | null> => {
    try {
  
      console.log(
       
        bandName,
        mobileNumber,
        description,
        user_id
      );
      const s3Response: any = await uploadS3Video(video);
      console.log("use case", s3Response);
      if (s3Response?.error) {
        console.error("Error uploading video to S3:", s3Response.error);
        throw new Error("Failed to upload video to S3");
      }

      console.log("URL of the video from the S3 bucket:", s3Response?.Location);
      const s3Location = s3Response.Location;
      // Use the updated repository method
      const response = await this._repository.videoUploadDB(
        bandName,
        mobileNumber,
        description,
        user_id,
        s3Location
      );
      console.log("resposnssssss", response);
      return response ? response : null;
    } catch (error) {
      console.error("Error occurred during video upload:", error);
      return null;
    }
  };


  uploadEvents = async (event: { 
    id:string;
    imageUrl: string; 
    title: string; 
    category: string; 
    userId: Types.ObjectId; 
    price: number; 
    teamLeader: string; 
    teamLeaderNumber: number; 
    description: string; 
  }): Promise<EventDocument | null> => {
    try {
     
      // Ensure that this._repository.uploadedEvent accepts the event data
      const uploadedEvent = await this._repository.uploadedEvent(event);
  
      // Return the uploaded event document or null if not successful
      return uploadedEvent ? uploadedEvent : null;
    } catch (error) {
      throw error;
    }
  };

// Define the function to edit events with specified parameter types and return type

// Use Case: Adjust to call editEvent in the repository
editEvents = async (eventId: string, event: {
  imageUrl: string;
  title: string;
  category: string;
  userId: Types.ObjectId;
  price: number;
  teamLeader: string;
  teamLeaderNumber: number;
  description: string;
}): Promise<EventDocument | null> => {
  try {
    const updatedEvent = await this._repository.editEvents(eventId, event);
    return updatedEvent;
  } catch (error) {
    throw error;
  }
};

toggleBlockStatus=async(id: string): Promise<EventDocument | null>=> {
  try {
   return this._repository.toggleBlockStatus(id)
  } catch (error) {
   throw error
   
  }
 }
}