"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEventController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const responseStatus_1 = require("../../../constants/responseStatus");
const bookingEvents_1 = require("../../../infrastructure/models/bookingEvents");
const constant_1 = require("../../../shared/utils/constant");
class UserEventController {
    constructor(useCase) {
        this.useCase = useCase;
        this.getAllEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = new mongoose_1.default.Types.ObjectId(req.params.id);
                const allEvents = yield this._useCase.getAllEvents(id);
                if (!allEvents || allEvents.length === 0) {
                    return res.status(responseStatus_1.ResponseStatus.NoContent).json(null);
                }
                res.status(responseStatus_1.ResponseStatus.OK).json(allEvents);
            }
            catch (error) {
                console.error("Error fetching events:", error);
                next(error);
            }
        });
        this.bookEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { formData, eventId, performerId, userId } = req.body;
                if (!formData || typeof formData !== "object") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid form data" });
                }
                if (!eventId || typeof eventId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid event ID" });
                }
                if (!performerId || typeof performerId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid performer ID" });
                }
                if (!userId || typeof userId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid user ID" });
                }
                const bookingResult = yield this._useCase.userBookEvent(formData, eventId, performerId, userId);
                if (!bookingResult) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        error: "Booking failed. No result returned.",
                        data: bookingResult,
                    });
                }
                res
                    .status(responseStatus_1.ResponseStatus.OK)
                    .json({
                    message: constant_1.EventMessages.EVENT_BOOKED_SUCCESS,
                    data: bookingResult,
                });
            }
            catch (error) {
                console.error("Error booking event:", error);
                next(error);
            }
        });
        this.upcomingEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ success: false, message: constant_1.UserMessages.INVALID_USER_ID });
                }
                const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
                const upcomingEvents = yield this._useCase.getAllUpcomingEvents(userObjectId);
                if (((_a = upcomingEvents === null || upcomingEvents === void 0 ? void 0 : upcomingEvents.upcomingEvents) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        totalCount: upcomingEvents.totalCount,
                        events: upcomingEvents.upcomingEvents,
                    });
                }
                return res
                    .status(responseStatus_1.ResponseStatus.NotFound)
                    .json({ success: false, EventMessages: constant_1.EventMessages });
            }
            catch (error) {
                next(error);
            }
        });
        this.cancelEventByUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const eventObjectId = new mongoose_1.default.Types.ObjectId(id);
                if (!eventObjectId) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({
                        success: false,
                        message: constant_1.EventMessages.EVENT_ID_REQUIRED,
                    });
                }
                const canceledEvent = yield this._useCase.cancelEvent(eventObjectId);
                if (canceledEvent) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        message: constant_1.EventMessages.EVENT_CANCELED_SUCCESS,
                        data: canceledEvent,
                    });
                }
                else {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({
                        success: false,
                        message: constant_1.EventMessages.EVENT_NOT_FOUND,
                    });
                }
            }
            catch (error) {
                return next(error);
            }
        });
        this.getUpcomingEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = new mongoose_1.default.Types.ObjectId(id);
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const upcomingEvents = yield this._useCase.getUpcomingEvents(userId, page);
                return res.json({ events: upcomingEvents || [] });
            }
            catch (error) {
                next(error);
            }
        });
        this.eventHistory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userObjectId = new mongoose_1.default.Types.ObjectId(id);
                const eventHistory = yield this._useCase.getAllEventHistory(userObjectId);
                if (((_a = eventHistory === null || eventHistory === void 0 ? void 0 : eventHistory.pastEventHistory) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        totalCount: eventHistory.totalCount,
                        events: eventHistory.pastEventHistory,
                    });
                }
                return res
                    .status(responseStatus_1.ResponseStatus.NotFound)
                    .json({ success: false, message: constant_1.EventMessages.NO_UPCOMING_EVENTS });
            }
            catch (error) {
                next(error);
            }
        });
        this.getEventHistory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const userId = new mongoose_1.default.Types.ObjectId(id);
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const getEventHistory = yield this._useCase.getEventHistory(userId, page);
                return res.json({ events: getEventHistory || [] });
            }
            catch (error) {
                next(error);
            }
        });
        this.getFavoriteEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const id = new mongoose_1.default.Types.ObjectId(userId);
                const favoriteEvent = yield this._useCase.favaroiteEvents(id);
                return res.status(responseStatus_1.ResponseStatus.OK).json({
                    success: true,
                    totalCount: favoriteEvent.totalEvent,
                    data: favoriteEvent.events,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.getFilteredEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const id = new mongoose_1.default.Types.ObjectId(userId);
                const { category, order, page, search } = req.query;
                const pageNumber = parseInt(page) || 1;
                const pageSize = 6;
                // Define type-safe filter options
                const filterOptions = {};
                if (category)
                    filterOptions.category = category;
                if (search)
                    filterOptions.title = { $regex: search, $options: "i" };
                const skip = (pageNumber - 1) * pageSize;
                const sortOrder = order === "desc" ? -1 : 1;
                const sortField = "price";
                const result = yield this._useCase.getFilteredEvents(id, filterOptions, { [sortField]: sortOrder }, skip, pageSize);
                if (!result || result.events.length === 0) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NoContent)
                        .json({ message: constant_1.EventMessages.NO_EVENTS_FOUND });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    events: result.events,
                    totalCount: result.totalCount,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(result.totalCount / pageSize),
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.addRating = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid event ID" });
                }
                const eventId = new mongoose_1.default.Types.ObjectId(id);
                const { rating, review } = req.body;
                // Validate rating
                if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Rating must be a number between 1 and 5" });
                }
                // Validate review
                if (!review ||
                    typeof review !== "string" ||
                    review.trim().length < 5 ||
                    review.length > 500) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({
                        error: "Review must be a string between 5 and 500 characters",
                    });
                }
                const eventRated = yield this._useCase.ratingAdded(eventId, rating, review);
                if (!eventRated) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NotFound)
                        .json({ error: constant_1.EventMessages.NO_EVENTS_FOUND });
                }
                res
                    .status(responseStatus_1.ResponseStatus.OK)
                    .json({
                    message: constant_1.EventMessages.RATING_ADDED_SUCCESS,
                    data: eventRated,
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.getEventRating = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid event ID" });
                }
                const eventId = new mongoose_1.default.Types.ObjectId(id);
                const eventRatings = yield this._useCase.getEventRating(eventId);
                if (!eventRatings || eventRatings.length === 0) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NotFound)
                        .json({ message: constant_1.EventMessages.NO_RATINGS_FOUND });
                }
                return res.status(responseStatus_1.ResponseStatus.OK).json({ ratings: eventRatings });
            }
            catch (error) {
                console.error("Error fetching event ratings:", error);
                next(error);
                return res
                    .status(500)
                    .json({ error: "An error occurred while fetching event ratings." });
            }
        });
        this.toggleFavoriteEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, eventId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId) ||
                    !mongoose_1.default.Types.ObjectId.isValid(eventId)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.EventMessages.INVALID_USER_OR_EVENT_ID });
                }
                const uid = new mongoose_1.default.Types.ObjectId(userId);
                const eid = new mongoose_1.default.Types.ObjectId(eventId);
                const result = yield this._useCase.toggleFavoriteEvent(uid, eid);
                return res
                    .status(responseStatus_1.ResponseStatus.OK)
                    .json({ message: "Event added to favorites", data: result });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateBookingDate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const newDate = new Date("2024-12-01");
                const newStatus = "completed";
                const updatedBooking = yield bookingEvents_1.BookingModel.findByIdAndUpdate(id, { date: newDate, bookingStatus: newStatus }, { new: true });
                if (!updatedBooking) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NotFound)
                        .json({ message: constant_1.EventMessages.NO_EVENTS_FOUND });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    message: constant_1.EventMessages.BOOKING_STATUS_CHANGE_SUCCESS,
                    booking: updatedBooking,
                });
            }
            catch (error) {
                console.error(error);
                next(error);
                res
                    .status(500)
                    .json({ message: constant_1.MessageConstants.INTERANAL_SERVER_ERROR });
            }
        });
        this.walletPayment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { formData, eventId, performerId, userId } = req.body;
                if (!formData || typeof formData !== "object") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid form data" });
                }
                if (!eventId || typeof eventId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid event ID" });
                }
                if (!performerId || typeof performerId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid performer ID" });
                }
                if (!userId || typeof userId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid user ID" });
                }
                const userWalletBookEvent = yield this._useCase.userWalletBookEvent(formData, eventId, performerId, userId);
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    message: constant_1.EventMessages.EVENT_BOOKED_SUCCESS,
                    data: userWalletBookEvent,
                });
            }
            catch (error) {
                console.error("Error booking event:", error);
                next(error);
            }
        });
        this.getAllPerformers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = new mongoose_1.default.Types.ObjectId(req.params.id);
                const performers = yield this._useCase.getAllPerformer(id);
                if (!performers || performers.length === 0) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NotFound)
                        .json({ message: constant_1.PerformerMessages.NO_PERFORMER_DATA });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({ success: true, data: performers });
            }
            catch (error) {
                console.error("Error fetching performers:", error);
                next(error); // Pass the error to the error handling middleware
            }
        });
        this.availableDate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { formData, eventId, performerId } = req.body;
                if (!formData || typeof formData !== "object") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid form data" });
                }
                if (!eventId || typeof eventId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid event ID" });
                }
                if (!performerId || typeof performerId !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ error: "Invalid performer ID" });
                }
                const availableDates = yield this._useCase.availableDate(formData, eventId, performerId);
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    message: constant_1.EventMessages.SUCCESS,
                    data: availableDates,
                });
            }
            catch (error) {
                console.error("Error retrieving available dates:", error);
                next(error);
            }
        });
        this.getFilteredPerformers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('helelejlralsddslaf;jd');
                const { userId } = req.params;
                const id = new mongoose_1.default.Types.ObjectId(userId);
                const { order, page, search } = req.query;
                const pageNumber = parseInt(page) || 1;
                const pageSize = 6;
                const skip = (pageNumber - 1) * pageSize;
                const sortOrder = order === "desc" ? -1 : 1;
                const sortField = "rating";
                const searchValue = typeof search === "string" ? search : "";
                console.log('e', searchValue);
                const filterOptions = searchValue
                    ? {
                        $or: [
                            { bandName: { $regex: searchValue, $options: "i" } },
                            { place: { $regex: searchValue, $options: "i" } },
                        ],
                    }
                    : {};
                console.log('okokokoksssserqreqerok', filterOptions, '22', sortField, '3ddddddddd3', sortOrder);
                const result = yield this._useCase.getFilteredPerformers(id, filterOptions, { [sortField]: sortOrder }, skip, pageSize);
                console.log('resuleeeeeeeeeeeet', result);
                if (!result || result.performers.length === 0) {
                    console.log(constant_1.PerformerMessages.NO_PERFORMER_DATA);
                    return res
                        .status(responseStatus_1.ResponseStatus.NoContent)
                        .json({ message: constant_1.PerformerMessages.NO_PERFORMER_DATA });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    performers: result.performers,
                    totalCount: result.totalCount,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(result.totalCount / pageSize),
                });
            }
            catch (error) {
                console.log('hello world');
                console.error("Error occurred:", error);
                next(error);
            }
        });
        this.getTopRatedEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = new mongoose_1.default.Types.ObjectId(id);
                const topRatedEvents = yield this._useCase.getTopRatedEvent(userId);
                if (topRatedEvents) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        message: constant_1.EventMessages.SUCCESS,
                        data: topRatedEvents,
                    });
                }
                else {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({
                        success: false,
                        message: constant_1.EventMessages.EVENT_NOT_FOUND,
                    });
                }
            }
            catch (error) {
                console.error("Error fetching top-rated events:", error);
                next(error);
                return res.status(500).json({
                    success: false,
                    message: constant_1.EventMessages.NO_EVENTS_FOUND,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this.getPerformer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { performerId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(performerId)) {
                    return res.status(400).json({ message: "Invalid performer ID" });
                }
                const id = new mongoose_1.default.Types.ObjectId(performerId);
                const performer = yield this._useCase.getPerformer(id);
                if (!performer) {
                    return res.status(404).json({ message: "Performer not found" });
                }
                res.status(200).json({ performer });
            }
            catch (error) {
                next(error);
            }
        });
        this.getPerformerEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { performerId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(performerId)) {
                    return res.status(400).json({ message: "Invalid performer ID" });
                }
                const id = new mongoose_1.default.Types.ObjectId(performerId);
                const performerEvents = yield this._useCase.getPerformerEvents(id);
                if (!performerEvents) {
                    return res
                        .status(404)
                        .json({ message: "No events found for this performer" });
                }
                return res.status(200).json({ success: true, data: performerEvents });
            }
            catch (error) {
                next(error);
            }
        });
        this.getEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { eventId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(eventId)) {
                    return res.status(400).json({ message: "Invalid event ID" });
                }
                const event = yield this._useCase.getEvent(new mongoose_1.default.Types.ObjectId(eventId));
                console.log("e;ldsfa", event);
                if (!event) {
                    return res.status(404).json({ message: "Event not found" });
                }
                return res.status(200).json({ success: true, data: event });
            }
            catch (error) {
                next(error);
            }
        });
        this._useCase = useCase;
    }
}
exports.UserEventController = UserEventController;
