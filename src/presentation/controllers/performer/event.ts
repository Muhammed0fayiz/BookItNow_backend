import { Response, Request, NextFunction } from "express";
import { IperformerEventUseCase } from "../../../application/interfaces/performer/useCase/event";
import { ResponseStatus } from "../../../constants/responseStatus";
import mongoose, { Types } from "mongoose";
import { ErrorMessages, EventMessages, MessageConstants } from "../../../shared/utils/constant";
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
     const {id}=req.params
      if (!req.body) {
        return res.status(ResponseStatus.BadRequest).json({ message: ErrorMessages.NO_EVENT_FOUND });
      }
      const event = {
        imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : null,
        title: req.body.title ? req.body.title.trim() : null,
        category: req.body.category ? req.body.category.trim() : null,
        userId: new Types.ObjectId(id),
        price: req.body.price ? parseFloat(req.body.price) : null, 
        teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : null,
        teamLeaderNumber: req.body.teamLeaderNumber
          ? parseInt(req.body.teamLeaderNumber, 10)
          : null, 
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
        return res.status(ResponseStatus.BadRequest).json({ message: ErrorMessages.ALL_FIELD_REQUIRED});
       
      }

      if (event.title.length < 2) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: EventMessages.EVENT_TITLE_ERROR });
      }
      if (isNaN(event.price)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: EventMessages.EVENT_PRICE_ERROR });
      }
      if (!/^\d{10}$/.test(event.teamLeaderNumber.toString())) {
        return res.status(ResponseStatus.BadRequest).json({
          message: EventMessages.PHONE_NUMBER_ERROR
        });
      }
      if (event.description.length < 10) {
        return res.status(ResponseStatus.BadRequest).json({
          message: EventMessages.DESCRIPTION_ERROR,
        });
      }

      // Upload event details
      const uploadedEvent = await this._useCase.uploadedEvents(event);
      if (uploadedEvent === "Event already exists") {
        return res.status(ResponseStatus.Conflict).json({
          message: EventMessages.EXISTING_EVENT_ERROR,
        });
      }
      
      if (uploadedEvent) {
        return res.status(ResponseStatus.Created).json({
          message:EventMessages.SUCCESS,
          event: uploadedEvent,
        });
      } else {
        return res.status(ResponseStatus.BadRequest).json({ message:EventMessages.FAILED_UPLOAD_EVENT });
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
      const {id}=req.params;
      const events = await this._useCase.getPerformerEvents(id);
      res.status(ResponseStatus.OK).json(events);
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
   const {id}=req.params;
      if (!id) {
        res.status(ResponseStatus.BadRequest).json({ message: MessageConstants.EVENT_ID_REQUIRED });
        return;
      }

      const deletedEvent = await this._useCase.deleteEvent(id);

      if (deletedEvent) {
        res.status(ResponseStatus.OK).json({ message: EventMessages.SUCCESS});
        return;
      } else {
        res.status(ResponseStatus.NotFound).json({ message: ErrorMessages.NO_EVENT_FOUND });
        return;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(ResponseStatus.InternalSeverError).json({ message: MessageConstants.INTERANAL_SERVER_ERROR });
      return;
    }
  };
  editEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any> | void> => {
    try {
      const userId = req.params.id;
      const eventId = req.params.eid;
      if (!req.body) {
        return res.status(ResponseStatus.BadRequest).json({ message: EventMessages.NO_EVENTS_FOUND });
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

 

      if (
        !event.title ||
        !event.category ||
        !event.price ||
        !event.teamLeader ||
        !event.teamLeaderNumber ||
        !event.description
      ) {
        return res.status(ResponseStatus.BadRequest).json({ message: ErrorMessages.ALL_FIELD_REQUIRED});
      }

      const updatedEvent = await this._useCase.editEvents(eventId, event);
   
      
      if (updatedEvent === "Event already exists" || updatedEvent === ErrorMessages.NO_EVENT_FOUND) {
        const status = updatedEvent === "Event already exists" ? ResponseStatus.Conflict : ResponseStatus.NotFound;
        const message = updatedEvent === "Event already exists" 
          ? "An event with the same category, title, and price already exists."
          : "Event not found.";
  
        return res.status(status).json({ message });
      }
     
      if (updatedEvent) {
        return res
          .status(ResponseStatus.OK)
          .json({ message: "Event updated successfully", event: updatedEvent });
      } else {
      

        return res.status(ResponseStatus.NotFound).json({ message: "Event not found." });
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
      if (!id || typeof id !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message:ErrorMessages.INVALID_OR_MISSING_ID});
      }
      const changedEvent = await this._useCase.toggleBlockStatus(id);
      if (!changedEvent) {
        return res
          .status(ResponseStatus.NotFound)
          .json({ message: EventMessages.EVENT_NOT_FOUND_OR_FAILED_UPDATE });
      }
      res.status(ResponseStatus.OK).json({
        message: "Block status toggled successfully",
        data: changedEvent,
      });
    } catch (error) {
      console.error("Error toggling block status:", error);
      res.status(ResponseStatus.InternalSeverError).json({ message:MessageConstants.INTERANAL_SERVER_ERROR });
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
        return res.status(ResponseStatus.OK).json({
          success: true,
          totalCount: upcomingEvents.totalCount,
          events: upcomingEvents.upcomingEvents,
        });
      }
      return res
        .status(ResponseStatus.NotFound)
        .json({ success: false, message: EventMessages.NO_EVENTS_FOUND });
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
      const {id}=req.params;
      const eventObjectId = new mongoose.Types.ObjectId(id);
      if (!eventObjectId) {
        return res.status(ResponseStatus.BadRequest).json({
          success: false,
          message:EventMessages.EVENT_ID_REQUIRED,
        });
      }
      const canceledEvent = await this._useCase.cancelEvent(eventObjectId);
      if (canceledEvent) {
        return res.status(ResponseStatus.OK).json({
          success: true,
          message: EventMessages.SUCCESS,
          data: canceledEvent,
        });
      } else {
        return res.status(ResponseStatus.NotFound).json({
          success: false,
          message: EventMessages.NO_EVENTS_FOUND,
        });
      }
    } catch (error) {
      return next(error);
    }
  };
  eventHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id}=req.params
      const userObjectId = new mongoose.Types.ObjectId(id);
      const result = await this._useCase.getAlleventHistory(userObjectId);
      if (result.eventHistory?.length > 0) {
        return res.status(ResponseStatus.OK).json({
          success: true,
          totalCount: result.totalCount,
          events: result.eventHistory,
        });
      }
      return res
        .status(ResponseStatus.NotFound)
        .json({ success: false, message: EventMessages.NO_EVENTS_FOUND });
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
    const {id}=req.params
      const performerId = new mongoose.Types.ObjectId(id);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const upcomingEvents = await this._useCase.getUpcomingEvents(
        performerId,
        page
      );
      return res.json({ events: upcomingEvents || [] });
    } catch (error) {
      next(error);
    }
  };
  appealBlockedEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, email } = req.params;
      const { appealMessage } = req.body;
      const eventId = new mongoose.Types.ObjectId(id);
      const appeal = await this._useCase.appealSend(
        eventId,
        email,
        appealMessage
      );
      res.status(ResponseStatus.OK).json({ message: EventMessages.SUCCESS, appeal });
    } catch (error) {
      next(error);
    }
  };
  getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const eventid = new mongoose.Types.ObjectId(id);
      const event = await this._useCase.getEvent(eventid);
      if (event) {
        res.status(ResponseStatus.OK).json({
          success: true,
          data: event,
        });
      } else {
        res.status(ResponseStatus.NotFound).json({
          success: false,
          message:EventMessages.NO_EVENTS_FOUND,
        });
      }
    } catch (error) {
      res.status(ResponseStatus.InternalSeverError).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
