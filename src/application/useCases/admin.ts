import { User, UserDocument } from "../../domain/entities/user";

import {
  TempPerformerDocument,
  TempPerformer,
} from "../../domain/entities/tempPerformer";

import { IadminUseCase } from "../interfaces/IadminUseCase";
import { IadminRepository } from "../interfaces/IadminRepository";
import { Types } from "mongoose";
import { Performer } from "../../domain/entities/performer";
import nodemailer from "nodemailer";
import { UserModel } from "../../infrastructure/models/userModel";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { AdminDocument } from "../../infrastructure/models/adminModel";
import bcrypt from "bcrypt";
import { AdminDetails } from "../../domain/entities/adminDetails";

export class adminUseCase implements IadminUseCase {
  private _repository: IadminRepository;

  constructor(private repository: IadminRepository) {
    this._repository = repository;
  }

  adminWallet=async(): Promise<AdminDocument []| null>=> {
    const adminWallet=await this._repository.adminWallet()
    return adminWallet
  }

  rejectedPermission = async (id: string): Promise<TempPerformer> => {
    try {
      // Fetch rejected performer data
      const tempPerformer = await this._repository.rejectedPermission(id);

      if (tempPerformer) {
        const user = await UserModel.findById(tempPerformer.user_id);

        if (user) {
    

          // Send rejection email
          try {
            const rejectionMessage = await this.sendRejectionEmail(user.email);
         
          } catch (error) {
            console.error("Error sending rejection email:", error);
          }
        }
      }

      return tempPerformer;
    } catch (error) {
      throw error;
    }
  };
  getAllPerformer = async (): Promise<Performer[] | null> => {
    try {
    
      return await this._repository.getAllPerformer();
    } catch (error) {
      throw error;
    }
  };
  grantedPermission = async (id: string): Promise<Performer> => {
    // Fetch performer data or handle logic here
    console.log("gran use");

    const performer = await this._repository.grantedPermission(id);

    if (performer) {
      const user = await UserModel.findById(performer.userId); // Declare user here

      if (user) {
  

        // Send congratulatory email
        try {
          const successMessage = await this.sendCongratulatoryEmail(user.email);
       
        } catch (error) {
          console.error("Error sending congratulatory email:", error);
        }
      }
    }

    return performer as unknown as Performer;
  };

  getUserDetails(id: string): unknown {
    throw new Error("Method not implemented.");
  }

  getTempPerformer = async (): Promise<any[] | null> => {
    try {
      return await this._repository.getTempPerformer();
    } catch (error) {
      throw error;
    }
  };

  userStatusChange = async (id: string, isblocked: boolean): Promise<User> => {
    try {
      return await this._repository.userStatusChange(id, isblocked);
    } catch (error) {
      throw error;
    }
  };
  performerStatusChange = async (
    id: string,
    isblocked: boolean,
    isverified: boolean
  ): Promise<User> => {
    try {
      console.log("use case performer");
      return await this._repository.performerStatusChange(
        id,
        isblocked,
        isverified
      );
    } catch (error) {
      throw error;
    }
  };
  getAllUser = async (): Promise<UserDocument[]> => {
    try {
      return await this._repository.getAllUser();
    } catch (error) {
      throw error;
    }
  };
  sendCongratulatoryEmail = async (email: string): Promise<string> => {
    try {
      console.log("Sending congratulatory email...");
      const sendEmail = async (email: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_ADDRESS, // Ensure the sender email is set
            to: email,
            subject: "Congratulations on Becoming a Performer!",
            html: `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear User,</p>
                <p>Congratulations! You have successfully become a performer on BookItNow.</p>
                <p>We look forward to seeing your amazing performances.</p>
              </div>
            `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve(info.response);
              console.log("Congratulatory mail sent.");
            }
          });
        });
      };

      const mailSent = await sendEmail(email);
      return mailSent;
    } catch (error) {
      console.error("Error in sending congratulatory mail:", error);
      throw error;
    }
  };

  sendRejectionEmail = async (email: string): Promise<string> => {
    try {
      console.log("Sending rejection email...");
      const sendEmail = async (email: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_ADDRESS, // Ensure the sender email is set
            to: email,
            subject: "Application Rejected",
            html: `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear User,</p>
                <p>We regret to inform you that your application to become a performer has been rejected.</p>
                <p>Feel free to apply again in the future, or contact support for more information.</p>
              </div>
            `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              reject(error);
            } else {
              resolve(info.response);
              console.log("Rejection mail sent.");
            }
          });
        });
      };

      const mailSent = await sendEmail(email);
      return mailSent;
    } catch (error) {
      console.error("Error in sending rejection mail:", error);
      throw error;
    }
  };
   
  getAllEvents=async(): Promise<EventDocument[]| null> =>{
    try {
       return this._repository.getAllEvents()
    } catch (error) {
      throw error
    }
    }


    toggleBlockStatus=async(id: string): Promise<EventDocument | null>=> {
     try {
      return this._repository.toggleBlockStatus(id)
     } catch (error) {
      throw error
      
     }
    }
    getAdminDetails=async(): Promise<AdminDetails>=> {
      try {
       const adminDetail= await this._repository.getAdminDetails()

     
       return adminDetail
      } catch (error) {
        throw error
      }
    }
  
}
