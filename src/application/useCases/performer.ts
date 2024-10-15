

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
export class performerUseCase implements IperformerUseCase {
  private _repository: IperformerRepository;

  constructor(private repository: IperformerRepository) {
    this._repository = repository;
  }
  // resendOtp(email: string): Promise<OtpUser> {
  //   throw new Error("Method not implemented.");
  // }

  addTempPerformer = async (
    bandName: string,
    place: string,
    videoUrl: string,
    category: string,
    description: string,
    userId: string
  ): Promise<TempPerformerDocument> => {
    // Create a new temp performer document
    const newTempPerformer = new TempPerformerModel({
      bandName,
      place,
      videoUrl,
      category,
      description,
      user_id: userId,
    });
  
    // Save the new temp performer
    const savedTempPerformer = await newTempPerformer.save();
  
    // Update the user document to set waitingPermission to true
    await UserModel.findByIdAndUpdate(userId, { waitingPermission: true });
  
    // Return the saved temp performer document
    return savedTempPerformer as TempPerformerDocument;
  };
  loginPerformer = async (email: string, password: string): Promise<asPerformer| null> => {
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
        { id: payload._id, username: payload.username, email: payload.email,role:'performer' },
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
        console.log('performer details');
        console.log('user performe', id);
        
        // Use the updated repository method
        const response = await this._repository.getPerformerDetails(id);
         
        return response ? response : null;
    } catch (error) {
        console.error("error occurred");

        return null;
    }
};

}
