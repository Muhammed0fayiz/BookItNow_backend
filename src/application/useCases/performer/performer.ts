import { OtpUser } from "../../../domain/entities/otpUser";
// import { OtpModel } from "../../infrastructure/models/otpSession";
import {
  UserDocuments,
  UserModel,
} from "../../../infrastructure/models/userModel";
import { checkOtp } from "../../../domain/entities/checkOtp";
import {
  TempPerformerDocument,
  TempPerformer,
} from "../../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../../infrastructure/models/tempPerformer";

import { IperformerUseCase } from "../../interfaces/performer/useCase/performer";
import { IperformerRepository } from "../../interfaces/performer/repositary/performer";
import { asPerformer } from "../../../domain/entities/asPerformer";
import jwt from "jsonwebtoken";
import { uploadS3Video } from "../../../infrastructure/s3/S3Video";
import mongoose, { Types } from "mongoose";
import {
  EventDocument,
  EventModel,
} from "../../../infrastructure/models/eventsModel";
import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { BookingDocument } from "../../../infrastructure/models/bookingEvents";
import { SlotDocuments } from "../../../infrastructure/models/slotModel";
import { SlotMangement } from "../../../domain/entities/slot";
import { performerAllDetails } from "../../../domain/entities/performerAllDetails";
import { User } from "../../../domain/entities/user";
import { PerformerReport } from "../../../domain/entities/performerReport";
export class performerUseCase implements IperformerUseCase {
  private _repository: IperformerRepository;

  constructor(private repository: IperformerRepository) {
    this._repository = repository;
  }




  getReport = async (
    performerId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<PerformerReport | null> => {
    try {
      const report = await this._repository.getReport(
        performerId,
        startDate,
        endDate
      );

      return report;
    } catch (error) {
      console.error("Error fetching performer report:", error);
      return null; // Return null in case of error
    }
  };
  getAllUsers = async (
    id: mongoose.Types.ObjectId
  ): Promise<UserDocuments[] | null> => {
    try {
      return await this._repository.getAllUsers(id);
    } catch (error) {
      throw error;
    }
  };
  performerAllDetails = async (
    id: mongoose.Types.ObjectId
  ): Promise<performerAllDetails | null> => {
    try {
      const allDetails = await this._repository.performerAllDetails(id);

      return allDetails;
    } catch (error) {
      throw error;
    }
  };
  loginPerformer = async (
    email: string,
    password: string
  ): Promise<asPerformer | null | string> => {
    try {
      return await this.repository.loginPerformer(email, password);
    } catch (error) {
      throw error;
    }
  };
  jwt = async (payload: asPerformer): Promise<string | null> => {
    try {
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
      const s3Response: any = await uploadS3Video(video);

      if (s3Response?.error) {
        console.error("Error uploading video to S3:", s3Response.error);
        throw new Error("Failed to upload video to S3");
      }

      const s3Location = s3Response.Location;

      const response = await this._repository.videoUploadDB(
        bandName,
        mobileNumber,
        description,
        user_id,
        s3Location
      );

      return response ? response : null;
    } catch (error) {
      console.error("Error occurred during video upload:", error);
      return null;
    }
  };

 
  slotDetails = async (
    id: mongoose.Types.ObjectId
  ): Promise<SlotMangement | null> => {
    try {
      const slotDetails = await this._repository.slotDetails(id);

      return slotDetails;
    } catch (error) {
      throw error;
    }
  };
  updateslot = async (
    id: mongoose.Types.ObjectId,
    date: Date
  ): Promise<SlotDocuments | null | string> => {
    try {
      return await this._repository.updateslot(id, date);
    } catch (error) {
      throw error;
    }
  };
}
