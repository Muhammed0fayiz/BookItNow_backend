import { TempPerformerDocument } from "../../../../infrastructure/models/tempPerformer";
import { UserDocuments } from "../../../../infrastructure/models/userModel";
import { asPerformer } from "../../../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { performerDocument } from "../../../../domain/entities/performer";
import { SlotDocuments } from "../../../../infrastructure/models/slotModel";
import { SlotMangement } from "../../../../domain/entities/slot";
import { performerAllDetails } from "../../../../domain/entities/performerAllDetails";
import { PerformerReport } from "../../../../domain/entities/performerReport";

export interface IperformerRepository {
  loginPerformer(
    email: string,
    password: string
  ): Promise<asPerformer | null | string>;
  getPerformerDetails(
    id: mongoose.Types.ObjectId
  ): Promise<performerDocument | null>;
  videoUploadDB(
    bandName: string,
    mobileNumber: string,
    description: string,
    user_id: mongoose.Types.ObjectId,
    s3Location: string
  ): Promise<TempPerformerDocument | null>;
  getAllUsers(id: mongoose.Types.ObjectId): Promise<UserDocuments[] | null>;
  getReport(
    performerId: mongoose.Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<PerformerReport | null>;
  performerAllDetails(
    id: mongoose.Types.ObjectId
  ): Promise<performerAllDetails | null>;

  
  slotDetails(id: mongoose.Types.ObjectId): Promise<SlotMangement | null>;
  updateslot(
    id: mongoose.Types.ObjectId,
    date: Date
  ): Promise<SlotDocuments | null | string>;
}
