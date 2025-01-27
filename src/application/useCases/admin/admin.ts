import { User, UserDocument } from "../../../domain/entities/user";

import {
  TempPerformerDocument,
  TempPerformer,
} from "../../../domain/entities/tempPerformer";

import { IadminUseCase } from "../../interfaces/admin/IadminUseCase";
import { IadminRepository } from "../../interfaces/admin/IadminRepository";
import { Types } from "mongoose";
import { Performer } from "../../../domain/entities/performer";
import nodemailer from "nodemailer";
import { UserModel } from "../../../infrastructure/models/userModel";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { AdminDocument } from "../../../infrastructure/models/adminModel";
import bcrypt from "bcrypt";
import { AdminDetails } from "../../../domain/entities/adminDetails";
import { AdminRevenue } from "../../../domain/entities/adminRevenue";
const ExcelJS = require("exceljs");
const path = require("path");
export class adminUseCase implements IadminUseCase {
  private _repository: IadminRepository;

  constructor(private repository: IadminRepository) {
    this._repository = repository;
  }
  getRevenue=async(offset: number, pageSize: number): Promise<{ totalCount: number; adminRevinue: AdminRevenue[]; } | null> =>{
   try {
     return await this._repository.getRevenue(offset,pageSize)
   } catch (error) {
    throw error
   }
  }








  getAdminDetails = async (): Promise<AdminDetails> => {
    try {
      const adminDetail = await this._repository.getAdminDetails();

      return adminDetail;
    } catch (error) {
      throw error;
    }
  };
  getReport = async (
    startdate: Date,
    endingdate: Date
  ): Promise<AdminDetails> => {
    const report = await this._repository.getReport(startdate, endingdate);

    return report;
  };
  adminWallet = async (): Promise<AdminDocument[] | null> => {
    const adminWallet = await this._repository.adminWallet();
    return adminWallet;
  };



  getTempPerformer = async (): Promise<any[] | null> => {
    try {
      return await this._repository.getTempPerformer();
    } catch (error) {
      throw error;
    }
  };
  grantedPermission = async (id: string): Promise<Performer> => {
 

    const performer = await this._repository.grantedPermission(id);

    if (performer) {
      const user = await UserModel.findById(performer.userId); // Declare user here

      if (user) {
      
        try {
          const successMessage = await this.sendCongratulatoryEmail(user.email);
        } catch (error) {
          console.error("Error sending congratulatory email:", error);
        }
      }
    }

    return performer as unknown as Performer;
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
  rejectedPermission = async (
    id: string,
    rejectReason: string
  ): Promise<TempPerformer> => {
    try {
      // Fetch rejected performer data
      const tempPerformer = await this._repository.rejectedPermission(id);

      if (tempPerformer) {
        const user = await UserModel.findById(tempPerformer.user_id);

        if (user) {
          // Send rejection email
          try {
            const rejectionMessage = await this.sendRejectionEmail(
              user.email,
              rejectReason
            );
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
  sendRejectionEmail = async (
    email: string,
    rejectReason: string
  ): Promise<string> => {
    try {
      console.log("Sending rejection email...");
      const sendEmail = async (
        email: string,
        rejectReason: string
      ): Promise<string> => {
        return new Promise((resolve, reject) => {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: "Application Rejected",
            html: `
              <div style="font-family: Arial, sans-serif;">
                <p>Dear User,</p>
                <p>We regret to inform you that your application to become a performer on <span style="color: blue; font-weight: bold;">BookItNow</span> has been rejected.</p>
                <p>Reason for Rejection: <span style="color: red; font-weight: bold;">${rejectReason}</span></p>
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

      const mailSent = await sendEmail(email, rejectReason);
      return mailSent;
    } catch (error) {
      console.error("Error in sending rejection mail:", error);
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
  performerStatusChange = async (
    id: string,
    isblocked: boolean,
    isverified: boolean
  ): Promise<User> => {
    try {
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
  userStatusChange = async (id: string, isblocked: boolean): Promise<User> => {
    try {
      return await this._repository.userStatusChange(id, isblocked);
    } catch (error) {
      throw error;
    }
  };




  getAllEvents = async (): Promise<EventDocument[] | null> => {
    try {
      return this._repository.getAllEvents();
    } catch (error) {
      throw error;
    }
  };
  toggleBlockStatus = async (
    id: string,
    blockingDetails?: { reason: string; duration: number | string }
  ): Promise<EventDocument | null> => {
    try {
      console.log('hari', blockingDetails?.reason, blockingDetails?.duration);
      
      if (!id) {
        throw new Error("Invalid or missing ID parameter.");
      }
  
      if (blockingDetails) {
        const { reason, duration } = blockingDetails;
  
        if (!reason || typeof reason !== "string") {
          throw new Error("Blocking reason must be a valid string.");
        }
  
        if (!duration || (typeof duration !== "number" && typeof duration !== "string")) {
          throw new Error("Blocking duration must be a valid number or string.");
        }
      }
    
      return await this._repository.toggleBlockStatus(id, blockingDetails);
    } catch (error) {
      console.error("Error in toggleBlockStatus use case:", error);
      throw error;
    }
  };
 

}
