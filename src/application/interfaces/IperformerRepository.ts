import { TempPerformerDocument } from "./../../infrastructure/models/tempPerformer";
import { OtpUser } from "./../../domain/entities/otpUser";
import { User, UserDocument } from "../../domain/entities/user";
import { checkOtp } from "../../domain/entities/checkOtp";
import { UserDocuments } from "../../infrastructure/models/userModel";
import { asPerformer } from "../../domain/entities/asPerformer";
import mongoose from "mongoose";
import { performerDocument } from "../../domain/entities/performer";


export interface IperformerRepository {

    loginPerformer(email: string, password: string): Promise<asPerformer | null>;
    getPerformerDetails(id: mongoose.Types.ObjectId): Promise<performerDocument | null>;
}
