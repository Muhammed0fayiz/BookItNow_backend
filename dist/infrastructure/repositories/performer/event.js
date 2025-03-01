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
Object.defineProperty(exports, "__esModule", { value: true });
exports.performerEventRepository = void 0;
const performerModel_1 = require("../../models/performerModel");
const userModel_1 = require("../../models/userModel");
const eventsModel_1 = require("../../models/eventsModel");
const bookingEvents_1 = require("../../models/bookingEvents");
const walletHistory_1 = require("../../models/walletHistory");
class performerEventRepository {
    constructor() {
        this.deleteEvent = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deleteEvent = yield eventsModel_1.EventModel.findByIdAndDelete(id);
                return deleteEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.getPerformerEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performerAllEvents = yield eventsModel_1.EventModel.find({ userId: id });
                return performerAllEvents;
            }
            catch (error) {
                throw error;
            }
        });
        this.uploadedEvents = (event) => __awaiter(this, void 0, void 0, function* () {
            try {
                const existingEvent = yield eventsModel_1.EventModel.findOne({
                    title: event.title,
                    userId: event.userId,
                });
                if (existingEvent) {
                    return "Event already exists";
                }
                const newEvent = yield eventsModel_1.EventModel.create(event);
                // Fetch the newly created event
                const createdEvent = yield eventsModel_1.EventModel.findById(newEvent._id);
                return createdEvent;
            }
            catch (error) {
                console.error("Error inserting event:", error);
                throw error;
            }
        });
        this.editEvents = (eventId, event) => __awaiter(this, void 0, void 0, function* () {
            try {
                const existingEvent = yield eventsModel_1.EventModel.findById(eventId);
                if (!existingEvent) {
                    return "Event not found";
                }
                const duplicateEvent = yield eventsModel_1.EventModel.findOne({
                    _id: { $ne: eventId },
                    title: event.title,
                    category: event.category,
                    price: event.price,
                });
                if (duplicateEvent) {
                    return "Event already exists";
                }
                const updatedEvent = yield eventsModel_1.EventModel.findByIdAndUpdate(eventId, { $set: event }, { new: true });
                return updatedEvent;
            }
            catch (error) {
                console.error("Error updating event:", error);
                throw error;
            }
        });
        this.toggleBlockStatus = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield eventsModel_1.EventModel.findById(id);
                if (!event)
                    return null;
                event.isperformerblockedevents = !event.isperformerblockedevents;
                const updatedEvent = yield event.save();
                return updatedEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllUpcomingEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: id }).lean();
                if (!performer) {
                    throw new Error("Performer not found");
                }
                // First, get the total count of upcoming events (without limit)
                const totalBookingsCount = yield bookingEvents_1.BookingModel.countDocuments({
                    performerId: performer._id,
                    date: { $gte: currentDate },
                });
                // Now, retrieve the upcoming events with limit and sorting
                const bookings = yield bookingEvents_1.BookingModel.find({
                    performerId: performer._id,
                    date: { $gte: currentDate },
                })
                    .sort({ date: 1 })
                    .limit(9) // Limit applied after counting
                    .populate({
                    path: "eventId",
                    model: "Event",
                    select: "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
                })
                    .populate("performerId", "name")
                    .populate("userId", "name")
                    .lean();
                // Map the bookings to the upcoming events
                const upcomingEvents = yield Promise.all(bookings.map((booking) => __awaiter(this, void 0, void 0, function* () {
                    const event = booking.eventId;
                    const user = booking.userId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
                        username: user.name,
                        price: booking.price,
                        status: event.status,
                        teamLeader: event.teamLeader,
                        teamLeaderNumber: event.teamLeaderNumber,
                        rating: event.rating,
                        description: event.description,
                        imageUrl: event.imageUrl,
                        isblocked: event.isblocked,
                        advancePayment: booking.advancePayment,
                        restPayment: booking.restPayment,
                        time: booking.time,
                        place: booking.place,
                        date: booking.date,
                        bookingStatus: booking.bookingStatus,
                        createdAt: booking.createdAt,
                        updatedAt: booking.updatedAt,
                        title: event.title,
                        category: event.category,
                    };
                })));
                return {
                    totalCount: totalBookingsCount,
                    upcomingEvents,
                };
            }
            catch (error) {
                console.error("Error in getAllUpcomingEvents:", error);
                throw error;
            }
        });
        this.cancelEvent = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                const event = yield bookingEvents_1.BookingModel.findById(id);
                if (!event) {
                    return null;
                }
                const dateDifferenceInDays = Math.floor((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (dateDifferenceInDays < 5) {
                    return null;
                }
                const { userId, advancePayment } = event;
                if (!userId) {
                    return null;
                }
                yield userModel_1.UserModel.findByIdAndUpdate(userId, {
                    $inc: { walletBalance: advancePayment },
                });
                const walletEntry = new walletHistory_1.WalletModel({
                    userId,
                    amount: advancePayment,
                    transactionType: "credit",
                    role: "user",
                    date: today,
                    description: "Event booking cancelled",
                });
                yield walletEntry.save();
                event.bookingStatus = "canceled";
                const updatedEvent = yield event.save();
                return updatedEvent;
            }
            catch (error) {
                console.error("Error canceling event:", error);
                throw error;
            }
        });
        this.getAlleventHistory = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: id }).lean();
                if (!performer) {
                    throw new Error("Performer not found");
                }
                // Get total count of past events
                const totalEventHistoryCount = yield bookingEvents_1.BookingModel.countDocuments({
                    performerId: performer._id,
                    date: { $lt: currentDate },
                });
                const bookings = yield bookingEvents_1.BookingModel.find({
                    performerId: performer._id,
                    date: { $lt: currentDate },
                })
                    .populate({
                    path: "eventId",
                    model: "Event",
                    select: "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
                })
                    .populate("performerId", "name")
                    .populate("userId", "name")
                    .lean();
                const eventHistory = bookings.map((booking) => {
                    const event = booking.eventId;
                    const user = booking.userId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
                        username: user === null || user === void 0 ? void 0 : user.name,
                        price: booking.price,
                        status: event === null || event === void 0 ? void 0 : event.status,
                        teamLeader: event === null || event === void 0 ? void 0 : event.teamLeader,
                        teamLeaderNumber: event === null || event === void 0 ? void 0 : event.teamLeaderNumber,
                        rating: event === null || event === void 0 ? void 0 : event.rating,
                        description: event === null || event === void 0 ? void 0 : event.description,
                        imageUrl: event === null || event === void 0 ? void 0 : event.imageUrl,
                        isblocked: event === null || event === void 0 ? void 0 : event.isblocked,
                        advancePayment: booking.advancePayment,
                        restPayment: booking.restPayment,
                        time: booking.time,
                        place: booking.place,
                        date: booking.date,
                        bookingStatus: booking.bookingStatus,
                        createdAt: booking.createdAt,
                        updatedAt: booking.updatedAt,
                        title: event === null || event === void 0 ? void 0 : event.title,
                        category: event === null || event === void 0 ? void 0 : event.category,
                    };
                });
                console.log('pasfffft', totalEventHistoryCount);
                return {
                    totalCount: totalEventHistoryCount,
                    eventHistory,
                };
            }
            catch (error) {
                console.error("Error in getAlleventHistory:", error);
                throw error;
            }
        });
        this.changeEventStatus = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield bookingEvents_1.BookingModel.find({
                    date: { $lt: new Date() },
                    bookingStatus: { $ne: "canceled" },
                });
                if (events.length === 0) {
                    return null;
                }
                const updatedEvents = yield Promise.all(events.map((event) => __awaiter(this, void 0, void 0, function* () {
                    event.bookingStatus = "completed";
                    return yield event.save();
                })));
                return updatedEvents;
            }
            catch (error) {
                throw error;
            }
        });
        this.getUpcomingEvents = (performerId, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const performer = yield performerModel_1.PerformerModel.findOne({
                    userId: performerId,
                }).lean();
                if (!performer) {
                    throw new Error("Performer not found");
                }
                const pageSize = 9;
                const skip = (page - 1) * pageSize;
                const matchQuery = {
                    performerId: performer._id,
                    date: { $gte: currentDate },
                };
                const bookings = yield bookingEvents_1.BookingModel.find(matchQuery)
                    .sort({ date: 1 })
                    .skip(skip)
                    .limit(pageSize)
                    .populate({
                    path: "eventId",
                    model: "Event",
                    select: "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
                })
                    .populate("userId", "name")
                    .lean();
                const upcomingEvents = bookings.map((booking) => {
                    const event = booking.eventId;
                    const user = booking.userId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
                        username: user.name,
                        price: booking.price,
                        status: event.status,
                        teamLeader: event.teamLeader,
                        teamLeaderNumber: event.teamLeaderNumber,
                        rating: event.rating,
                        description: event.description,
                        imageUrl: event.imageUrl,
                        isblocked: event.isblocked,
                        advancePayment: booking.advancePayment,
                        restPayment: booking.restPayment,
                        time: booking.time,
                        place: booking.place,
                        date: booking.date,
                        bookingStatus: booking.bookingStatus,
                        createdAt: booking.createdAt,
                        updatedAt: booking.updatedAt,
                        title: event.title,
                        category: event.category,
                    };
                });
                return upcomingEvents;
            }
            catch (error) {
                console.error("Error in getUpcomingEvents:", error);
                throw error;
            }
        });
        this.getEvent = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield eventsModel_1.EventModel.findById(eventId);
                return event;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.performerEventRepository = performerEventRepository;
