import { Response, Request, NextFunction } from "express";
import { IuserEventUseCase } from "../../../application/interfaces/user/useCase/event";
import mongoose from "mongoose";
import { ResponseStatus } from "../../../constants/responseStatus";
import { BookingModel } from "../../../infrastructure/models/bookingEvents";
import {
  EventMessages,
  MessageConstants,
  PerformerMessages,
  UserMessages,
} from "../../../shared/utils/constant";
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
        return res.status(ResponseStatus.NoContent).json(null);
      }
      res.status(ResponseStatus.OK).json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      next(error);
    }
  };
  bookEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formData, eventId, performerId, userId } = req.body;
      if (!formData || typeof formData !== "object") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid form data" });
      }
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid event ID" });
      }
      if (!performerId || typeof performerId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid performer ID" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid user ID" });
      }



      const bookingResult = await this._useCase.userBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );


  
      
      if (!bookingResult) {
        return res.status(ResponseStatus.OK).json({
          error: "Booking failed. No result returned.",
          data: bookingResult,
        });
      }
      res
        .status(ResponseStatus.OK)
        .json({
          message: EventMessages.EVENT_BOOKED_SUCCESS,
          data: bookingResult,
        });
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
          .status(ResponseStatus.BadRequest)
          .json({ success: false, message: UserMessages.INVALID_USER_ID });
      }

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
        .json({ success: false, EventMessages });
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
      const { id } = req.params;
      const eventObjectId = new mongoose.Types.ObjectId(id);
      if (!eventObjectId) {
        return res.status(ResponseStatus.BadRequest).json({
          success: false,
          message: EventMessages.EVENT_ID_REQUIRED,
        });
      }
      const canceledEvent = await this._useCase.cancelEvent(eventObjectId);
      if (canceledEvent) {
        return res.status(ResponseStatus.OK).json({
          success: true,
          message: EventMessages.EVENT_CANCELED_SUCCESS,
          data: canceledEvent,
        });
      } else {
        return res.status(ResponseStatus.NotFound).json({
          success: false,
          message: EventMessages.EVENT_NOT_FOUND,
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
      const { id } = req.params;
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
      const { id } = req.params;
      const userObjectId = new mongoose.Types.ObjectId(id);
      const eventHistory = await this._useCase.getAllEventHistory(userObjectId);
      if (eventHistory?.pastEventHistory?.length > 0) {
        return res.status(ResponseStatus.OK).json({
          success: true,
          totalCount: eventHistory.totalCount,
          events: eventHistory.pastEventHistory,
        });
      }
      return res
        .status(ResponseStatus.NotFound)
        .json({ success: false, message: EventMessages.NO_UPCOMING_EVENTS });
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


      return res.status(ResponseStatus.OK).json({
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
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 6;
  
      // Define type-safe filter options
      const filterOptions: Partial<{ category: string; title: { $regex: string; $options: string } }> = {};
      if (category) filterOptions.category = category as string;
      if (search) filterOptions.title = { $regex: search as string, $options: "i" };
  
      const skip = (pageNumber - 1) * pageSize;
      const sortOrder = order === "desc" ? -1 : 1;
      const sortField = "price";
  

  
      const result = await this._useCase.getFilteredEvents(
        id,
        filterOptions,
        { [sortField]: sortOrder } as Record<string, 1 | -1>,
        skip,
        pageSize
      );
  
      if (!result || result.events.length === 0) {
        return res
          .status(ResponseStatus.NoContent)
          .json({ message: EventMessages.NO_EVENTS_FOUND });
      }
  
      res.status(ResponseStatus.OK).json({
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
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid event ID" });
      }

      const eventId = new mongoose.Types.ObjectId(id);
      const { rating, review } = req.body;

      // Validate rating
      if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Rating must be a number between 1 and 5" });
      }

      // Validate review
      if (
        !review ||
        typeof review !== "string" ||
        review.trim().length < 5 ||
        review.length > 500
      ) {
        return res.status(ResponseStatus.BadRequest).json({
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
          .status(ResponseStatus.NotFound)
          .json({ error: EventMessages.NO_EVENTS_FOUND });
      }

      res
        .status(ResponseStatus.OK)
        .json({
          message: EventMessages.RATING_ADDED_SUCCESS,
          data: eventRated,
        });
    } catch (error) {
      next(error);
    }
  };
  getEventRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid event ID" });
      }
      const eventId = new mongoose.Types.ObjectId(id);
      const eventRatings = await this._useCase.getEventRating(eventId);
      if (!eventRatings || eventRatings.length === 0) {
        return res
          .status(ResponseStatus.NotFound)
          .json({ message: EventMessages.NO_RATINGS_FOUND });
      }
      return res.status(ResponseStatus.OK).json({ ratings: eventRatings });
    } catch (error) {
      console.error("Error fetching event ratings:", error);
      next(error)
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
      const { userId, eventId } = req.params;
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(eventId)
      ) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: EventMessages.INVALID_USER_OR_EVENT_ID });
      }
      const uid = new mongoose.Types.ObjectId(userId);
      const eid = new mongoose.Types.ObjectId(eventId);
      const result = await this._useCase.toggleFavoriteEvent(uid, eid);
      return res
        .status(ResponseStatus.OK)
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
      const { id } = req.params;
      const newDate = new Date("2024-12-01");
      const newStatus = "completed";

      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        { date: newDate, bookingStatus: newStatus },
        { new: true }
      );

      if (!updatedBooking) {
        return res
          .status(ResponseStatus.NotFound)
          .json({ message: EventMessages.NO_EVENTS_FOUND });
      }

      res.status(ResponseStatus.OK).json({
        message: EventMessages.BOOKING_STATUS_CHANGE_SUCCESS,
        booking: updatedBooking,
      });
    } catch (error) {
      console.error(error);
      next(error);
      res
        .status(500)
        .json({ message: MessageConstants.INTERANAL_SERVER_ERROR });
    }
  };
  walletPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formData, eventId, performerId, userId } = req.body;
      if (!formData || typeof formData !== "object") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid form data" });
      }
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid event ID" });
      }
      if (!performerId || typeof performerId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid performer ID" });
      }
      if (!userId || typeof userId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid user ID" });
      }
      const userWalletBookEvent = await this._useCase.userWalletBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );
      res.status(ResponseStatus.OK).json({
        message: EventMessages.EVENT_BOOKED_SUCCESS,
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
        return res
          .status(ResponseStatus.NotFound)
          .json({ message: PerformerMessages.NO_PERFORMER_DATA });
      }

      res.status(ResponseStatus.OK).json({ success: true, data: performers });
    } catch (error) {
      console.error("Error fetching performers:", error);
      next(error); // Pass the error to the error handling middleware
    }
  };
  availableDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { formData, eventId, performerId } = req.body;
      if (!formData || typeof formData !== "object") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid form data" });
      }
      if (!eventId || typeof eventId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid event ID" });
      }
      if (!performerId || typeof performerId !== "string") {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ error: "Invalid performer ID" });
      }

      const availableDates = await this._useCase.availableDate(
        formData,
        eventId,
        performerId
      );

      res.status(ResponseStatus.OK).json({
        message: EventMessages.SUCCESS,
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
      console.log('helelejlralsddslaf;jd');
      
      const { userId } = req.params;
      const id = new mongoose.Types.ObjectId(userId);
  
      const { order, page, search } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 6;
      const skip = (pageNumber - 1) * pageSize;
      const sortOrder = order === "desc" ? -1 : 1;
      const sortField = "rating";
  
      const searchValue = typeof search === "string" ? search : "";

      console.log('e',searchValue);
      
      const filterOptions: Record<string, unknown> = searchValue
        ? {
            $or: [
              { bandName: { $regex: searchValue, $options: "i" } },
              { place: { $regex: searchValue, $options: "i" } },
            ],
          }
        : {};

        console.log('okokokoksssserqreqerok',filterOptions,'22',sortField,'3ddddddddd3',sortOrder)
  
      const result = await this._useCase.getFilteredPerformers(
        id,
        filterOptions,
        { [sortField]: sortOrder },
        skip,
        pageSize
      );

      console.log('resuleeeeeeeeeeeet',result);
      
  
      if (!result || result.performers.length === 0) {
        console.log(PerformerMessages.NO_PERFORMER_DATA);
        return res
          .status(ResponseStatus.NoContent)
          .json({ message: PerformerMessages.NO_PERFORMER_DATA });
      }
  
      res.status(ResponseStatus.OK).json({
        performers: result.performers,
        totalCount: result.totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.totalCount / pageSize),
      });
    } catch (error) {
      console.log('hello world');
      
      console.error("Error occurred:", error);
      next(error);
    }
  };
  getTopRatedEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = new mongoose.Types.ObjectId(id);

      const topRatedEvents = await this._useCase.getTopRatedEvent(userId);

      if (topRatedEvents) {
        return res.status(ResponseStatus.OK).json({
          success: true,
          message: EventMessages.SUCCESS,
          data: topRatedEvents,
        });
      } else {
        return res.status(ResponseStatus.NotFound).json({
          success: false,
          message: EventMessages.EVENT_NOT_FOUND,
        });
      }
    } catch (error) {
      console.error("Error fetching top-rated events:", error);
      next(error)
      return res.status(500).json({
        success: false,
        message: EventMessages.NO_EVENTS_FOUND,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  getPerformer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { performerId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(performerId)) {
        return res.status(400).json({ message: "Invalid performer ID" });
      }

      const id = new mongoose.Types.ObjectId(performerId);
      const performer = await this._useCase.getPerformer(id);

      if (!performer) {
        return res.status(404).json({ message: "Performer not found" });
      }

      res.status(200).json({ performer });
    } catch (error) {
      next(error);
    }
  };
  getPerformerEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { performerId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(performerId)) {
        return res.status(400).json({ message: "Invalid performer ID" });
      }

      const id = new mongoose.Types.ObjectId(performerId);
      const performerEvents = await this._useCase.getPerformerEvents(id);

      if (!performerEvents) {
        return res
          .status(404)
          .json({ message: "No events found for this performer" });
      }

      return res.status(200).json({ success: true, data: performerEvents });
    } catch (error) {
      next(error);
    }
  };
  getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const event = await this._useCase.getEvent(
        new mongoose.Types.ObjectId(eventId)
      );
      console.log("e;ldsfa", event);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.status(200).json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  };
}
