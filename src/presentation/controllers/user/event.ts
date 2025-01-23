import { Response, Request, NextFunction } from "express";
import { isValidEmail } from "../../../shared/utils/validEmail";
import { ResponseStatus } from "../../../constants/responseStatus";
import { IuserEventUseCase } from "../../../application/interfaces/user/useCase/event";
import { User } from "../../../domain/entities/user";
import { isValidPassword } from "../../../shared/utils/validPassword";
import { isValidFullName } from "../../../shared/utils/validName";

import { TempPerformer } from "../../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../../infrastructure/models/tempPerformer";
import mongoose, { Types } from "mongoose";

import {
  UserDocuments,
  UserModel,
} from "../../../infrastructure/models/userModel";

import { BookingModel } from "../../../infrastructure/models/bookingEvents";
import { log } from "console";
import { generateOTP } from "../../../shared/utils/generateOtp";

export class UserEventController {
  private _useCase: IuserEventUseCase;

  constructor(private useCase: IuserEventUseCase) {
    this._useCase = useCase;
  }

  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {

      
      const id = new mongoose.Types.ObjectId(req.params.id);
      const allEvents = await this._useCase.getAllEvents(id);

      if (!allEvents || allEvents.length === 0) {
        // No events found
        return res.status(204).json(null);
      }

      res.status(200).json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      next(error); // Pass the error to the next middleware
    }
  };
  bookEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formData, eventId, performerId, userId } = req.body;

      if (!formData || typeof formData !== "object") {
        return res.status(400).json({ error: "Invalid form data" });
      }
      if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      if (!performerId || typeof performerId !== "string") {
        return res.status(400).json({ error: "Invalid performer ID" });
      }
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const bookingResult = await this._useCase.userBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );

      res
        .status(200)
        .json({ message: "Event booked successfully", data: bookingResult });
    } catch (error) {
      console.error("Error booking event:", error);
      next(error);
    }
  };
  upcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {

      
      const userId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user ID format." });
      }

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
  getUpcomingEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;
      const userId = new mongoose.Types.ObjectId(id);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      const upcomingEvents = await this._useCase.getUpcomingEvents(
        userId,
        page
      );

      return res.json({ events: upcomingEvents || [] });
    } catch (error) {
      next(error);
    }
  };
  eventHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const eventHistory = await this._useCase.getAllEventHistory(userObjectId);

      if (eventHistory?.pastEventHistory?.length > 0) {
        return res.status(200).json({
          success: true,
          totalCount: eventHistory.totalCount,
          events: eventHistory.pastEventHistory,
        });
      }

      return res
        .status(404)
        .json({ success: false, message: "No upcoming events found." });
    } catch (error) {
      next(error);
    }
  };
  getEventHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = new mongoose.Types.ObjectId(id);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      const getEventHistory = await this._useCase.getEventHistory(userId, page);

      return res.json({ events: getEventHistory || [] });
    } catch (error) {
      next(error);
    }
  };
  getFavoriteEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      const id = new mongoose.Types.ObjectId(userId);

      const favoriteEvent = await this._useCase.favaroiteEvents(id);

      return res.status(200).json({
        success: true,
        totalCount: favoriteEvent.totalEvent,
        data: favoriteEvent.events,
      });
    } catch (error) {
      next(error);
    }
  };
  getFilteredEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      const id = new mongoose.Types.ObjectId(userId);
      const { category, order, page, search } = req.query;

      console.log(
        "category:",
        category,
        "order:",
        order,
        "page:",
        page,
        "search:",
        search
      );

      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 6; // Optional: Default page size

      const filterOptions: any = {};
      if (category) filterOptions.category = category;
      if (search) filterOptions.title = { $regex: search, $options: "i" };

      const skip = (pageNumber - 1) * pageSize;

      const sortOrder = order === "desc" ? -1 : 1;
      const sortField = "createdAt"; // Default sort field

      const result = await this._useCase.getFilteredEvents(
        id,
        filterOptions,
        { [sortField]: sortOrder },
        skip,
        pageSize
      );
      console.log("result", result);

      if (!result || result.events.length === 0) {
        return res.status(204).json({ message: "No events found." });
      }

      res.status(200).json({
        events: result.events,
        totalCount: result.totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.totalCount / pageSize),
      });
    } catch (error) {
      next(error);
    }
  };
  addRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const eventId = new mongoose.Types.ObjectId(id);
      const { rating, review } = req.body;

      // Validate rating
      if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be a number between 1 and 5" });
      }

      // Validate review
      if (
        !review ||
        typeof review !== "string" ||
        review.trim().length < 5 ||
        review.length > 500
      ) {
        return res.status(400).json({
          error: "Review must be a string between 5 and 500 characters",
        });
      }

      const eventRated = await this._useCase.ratingAdded(
        eventId,
        rating,
        review
      );

      if (!eventRated) {
        return res
          .status(404)
          .json({ error: "Event not found or rating could not be added" });
      }

      res
        .status(200)
        .json({ message: "Rating added successfully", data: eventRated });
    } catch (error) {
      next(error);
    }
  };
  getEventRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const eventId = new mongoose.Types.ObjectId(id);
      const eventRatings = await this._useCase.getEventRating(eventId);

      if (!eventRatings || eventRatings.length === 0) {
        return res
          .status(404)
          .json({ message: "No ratings found for this event." });
      }

      return res.status(200).json({ ratings: eventRatings });
    } catch (error) {
      console.error("Error fetching event ratings:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching event ratings." });
    }
  };

  toggleFavoriteEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.userId;
      const eventId = req.params.eventId;

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(eventId)
      ) {
        return res.status(400).json({ message: "Invalid user or event ID" });
      }
      const uid = new mongoose.Types.ObjectId(userId);
      const eid = new mongoose.Types.ObjectId(eventId);

      const result = await this._useCase.toggleFavoriteEvent(uid, eid);

      return res
        .status(200)
        .json({ message: "Event added to favorites", data: result });
    } catch (error) {
      next(error);
    }
  };
  updateBookingDate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.params.id;
      const newDate = new Date("2024-12-01");
      const newStatus = "completed";

      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        { date: newDate, bookingStatus: newStatus },
        { new: true }
      );

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json({
        message: "Booking date and status updated successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  walletPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formData, eventId, performerId, userId } = req.body;

      if (!formData || typeof formData !== "object") {
        return res.status(400).json({ error: "Invalid form data" });
      }
      if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      if (!performerId || typeof performerId !== "string") {
        return res.status(400).json({ error: "Invalid performer ID" });
      }
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const userWalletBookEvent = await this._useCase.userWalletBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );

      res.status(200).json({
        message: "Event booked successfully",
        data: userWalletBookEvent,
      });
    } catch (error) {
      console.error("Error booking event:", error);
      next(error);
    }
  };

  getAllPerformers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const performers = await this._useCase.getAllPerformer(id);

      if (!performers || performers.length === 0) {
        return res.status(404).json({ message: "No performers found." });
      }

      res.status(200).json({ success: true, data: performers });
    } catch (error) {
      console.error("Error fetching performers:", error);
      next(error); // Pass the error to the error handling middleware
    }
  };
  availableDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formData, eventId, performerId } = req.body;

      if (!formData || typeof formData !== "object") {
        return res.status(400).json({ error: "Invalid form data" });
      }
      if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      if (!performerId || typeof performerId !== "string") {
        return res.status(400).json({ error: "Invalid performer ID" });
      }

      const availableDates = await this._useCase.availableDate(
        formData,
        eventId,
        performerId
      );

      res.status(200).json({
        message: "Available dates retrieved successfully",
        data: availableDates,
      });
    } catch (error) {
      console.error("Error retrieving available dates:", error);
      next(error);
    }
  };
  getFilteredPerformers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Request to get filtered performers initiated.");

      const { userId } = req.params;
      const id = new mongoose.Types.ObjectId(userId);

      const { order, page, search } = req.query;
      console.log(
        "Query Parameters - Order:",
        order,
        "Page:",
        page,
        "Search:",
        search
      );

      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 6;
      const skip = (pageNumber - 1) * pageSize;
      const sortOrder = order === "desc" ? -1 : 1;
      const sortField = "rating";

      const searchValue = typeof search === "string" ? search : "";
      const filterOptions: any = searchValue
        ? {
            $or: [
              { bandName: { $regex: searchValue, $options: "i" } },
              { place: { $regex: searchValue, $options: "i" } },
            ],
          }
        : {};
      console.log("Final Filter Options:", filterOptions);

      const result = await this._useCase.getFilteredPerformers(
        id,
        filterOptions,
        { [sortField]: sortOrder },
        skip,
        pageSize
      );

      console.log("Query Result:", result);

      if (!result || result.performers.length === 0) {
        console.log("No performers found.");
        return res.status(204).json({ message: "No performers found." });
      }

      res.status(200).json({
        performers: result.performers,
        totalCount: result.totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.totalCount / pageSize),
      });
    } catch (error) {
      console.error("Error occurred:", error);
      next(error);
    }
  };

  
}
