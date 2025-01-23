import { loginpefomer } from "../../../../../frontend/src/datas/logindatas";
import { Response, Request, NextFunction } from "express";
import { isValidEmail } from "../../../shared/utils/validEmail";
import { ResponseStatus } from "../../../constants/responseStatus";
import { IuserUseCase } from "../../../application/interfaces/user/useCase/user";
import { User } from "../../../domain/entities/user";
import { isValidPassword } from "../../../shared/utils/validPassword";
import { isValidFullName } from "../../../shared/utils/validName";
import { generateOTP } from "../../../shared/utils/generateOtp";
import { TempPerformer } from "../../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../../infrastructure/models/tempPerformer";
import { IperformerEventUseCase } from "../../../application/interfaces/performer/useCase/event";
import { asPerformer } from "../../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import {
  PerformerDocuments,
  PerformerModel,
} from "../../../infrastructure/models/performerModel";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
const ExcelJS = require("exceljs");
export class performerEventController {
  private _useCase: IperformerEventUseCase;

  constructor(private useCase: IperformerEventUseCase) {
    this._useCase = useCase;
  }



  uploadEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any> | void> => {
    try {
      console.log('uplaod eventdf adlskfj');
      console.log(req.body,'id');
      
      const id = req.params.id;

      if (!req.body) {
        return res.status(400).json({ message: "No event data provided." });
        console.log('this error');
        
      }

      const event = {
        imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : null,
        title: req.body.title ? req.body.title.trim() : null,
        category: req.body.category ? req.body.category.trim() : null,
        userId: new Types.ObjectId(id), // Convert userId to ObjectId
        price: req.body.price ? parseFloat(req.body.price) : null, // Convert price to number
        teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : null,
        teamLeaderNumber: req.body.teamLeaderNumber
          ? parseInt(req.body.teamLeaderNumber, 10)
          : null, // Convert teamLeaderNumber to number
        description: req.body.description ? req.body.description.trim() : null,
      };

      if (
        !event.imageUrl ||
        !event.title ||
        !event.category ||
        !event.userId ||
        !event.price ||
        !event.teamLeader ||
        !event.teamLeaderNumber ||
        !event.description
      ) {
        return res.status(400).json({ message: "All fields are required." });
        console.log('no errr');
        
      }

      if (event.title.length < 2) {
        return res
          .status(400)
          .json({ message: "Title must be at least 2 characters long." });
      }
      if (isNaN(event.price)) {
        return res
          .status(400)
          .json({ message: "Price must be a valid number." });
      }
      if (!/^\d{10}$/.test(event.teamLeaderNumber.toString())) {
        return res.status(400).json({
          message: "Team leader number must be a valid 10-digit number.",
        });
      }
      if (event.description.length < 10) {
        return res.status(400).json({
          message: "Description must be at least 10 characters long.",
        });
      }

      // Upload event details
      const uploadedEvent = await this._useCase.uploadEvents(event);

      console.log('id',uploadedEvent,'id')
      if (uploadedEvent) {
        return res.status(201).json({
          message: "Event uploaded successfully",
          event: uploadedEvent,
        });
      } else {
        return res.status(400).json({ message: "Failed to upload event." });
      }
    } catch (error) {
      next(error);
    }
  };
  getPerformerEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const id = req.params.id;

      const events = await this._useCase.getPerformerEvents(id);

      res.status(200).json(events);
      return events;
    } catch (error) {
      next(error);
      return null;
    }
  };
  deleteEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: "Event ID is required" });
        return;
      }

      const deletedEvent = await this._useCase.deleteEvent(id);

      if (deletedEvent) {
        res.status(200).json({ message: "Event deleted successfully" });
        return;
      } else {
        res.status(404).json({ message: "Event not found" });
        return;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };
  editEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any> | void> => {
    try {
      console.log('edi ts fdsalfdlssd');
      
      const userId = req.params.id;
      const eventId = req.params.eid;
      

      if (!req.body) {
        return res.status(400).json({ message: "No event data provided." });
      }

      const event: {
        imageUrl?: string;
        title: string;
        category: string;
        userId: Types.ObjectId;
        price: number;
        teamLeader: string;
        teamLeaderNumber: number;
        description: string;
      } = {
        imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : undefined,
        title: req.body.title ? req.body.title.trim() : "",
        category: req.body.category ? req.body.category.trim() : "",
        userId: new Types.ObjectId(userId),
        price: req.body.price ? parseFloat(req.body.price) : 0,
        teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : "",
        teamLeaderNumber: req.body.teamLeaderNumber
          ? parseInt(req.body.teamLeaderNumber, 10)
          : 0,
        description: req.body.description ? req.body.description.trim() : "",
      };

      console.log('evenssss',event);
      

      if (
        !event.title ||
        !event.category ||
        !event.price ||
        !event.teamLeader ||
        !event.teamLeaderNumber ||
        !event.description
      ) { console.log('errr1');
        return res.status(400).json({ message: "All fields are required." });
      }

      const updatedEvent = await this._useCase.editEvents(eventId, event);
      console.log('updated',updatedEvent);
      
      if (updatedEvent) {
        return res
          .status(200)
          .json({ message: "Event updated successfully", event: updatedEvent });
      } else {
        console.log('errr2');
        
        return res.status(404).json({ message: "Event not found." });
      }
    } catch (error) {
      next(error);
    }
  };
  toggleBlockStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      // Validate id
      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ message: "Invalid or missing ID parameter" });
      }

      const changedEvent = await this._useCase.toggleBlockStatus(id);

      // If the toggle operation did not affect any records
      if (!changedEvent) {
        return res
          .status(404)
          .json({ message: "Event not found or update failed" });
      }

      // Success response
      res.status(200).json({
        message: "Block status toggled successfully",
        data: changedEvent,
      });
    } catch (error) {
      // Error handling
      console.error("Error toggling block status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  upcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const upcomingEvents = await this._useCase.getAllUpcomingEvents(
        userObjectId
      );
   
      if (upcomingEvents?.upcomingEvents?.length > 0) {
        return res.status(200).json({
          success: true,
          totalCount: upcomingEvents.totalCount,
          events: upcomingEvents.upcomingEvents,
        });
      }

      return res
        .status(404)
        .json({ success: false, message: "No upcoming events found." });
    } catch (error) {
      next(error);
    }
  };
  cancelEventByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;
      const eventObjectId = new mongoose.Types.ObjectId(id);
      if (!eventObjectId) {
        return res.status(400).json({
          success: false,
          message: "Event ID is required.",
        });
      }

      const canceledEvent = await this._useCase.cancelEvent(eventObjectId);

      if (canceledEvent) {
        return res.status(200).json({
          success: true,
          message: "Event canceled successfully.",
          data: canceledEvent,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Event not found or could not be canceled.",
        });
      }
    } catch (error) {
      return next(error);
    }
  };
  eventHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userObjectId = new mongoose.Types.ObjectId(userId);
  
      const result = await this._useCase.getAlleventHistory(userObjectId);
      if (result.eventHistory?.length > 0) {
        return res.status(200).json({
          success: true,
          totalCount: result.totalCount,
          events: result.eventHistory,
        });
      }
  
      return res
        .status(404)
        .json({ success: false, message: "No past events found." });
    } catch (error) {
      next(error);
    }
  };
  

  changeEventStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    return await this._useCase.changeEventStatus();
  };

  getUpcomingEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;

      const performerId = new mongoose.Types.ObjectId(id);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      const upcomingEvents = await this._useCase.getUpcomingEvents(
        performerId,
        page
      );
      console.log(upcomingEvents);
      return res.json({ events: upcomingEvents || [] });
    } catch (error) {
      next(error);
    }
  };
  getEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
 
      
      const { id } = req.params;
      console.log('is ok',id);
      const eventid = new mongoose.Types.ObjectId(id);
      const event = await this._useCase.getEvent(eventid);
  console.log('event',event);
  
      if (event) {
        res.status(200).json({
          success: true,
          data: event,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        
      });
    }
  };

}
