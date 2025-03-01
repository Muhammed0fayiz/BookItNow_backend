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
exports.userEventRepository = void 0;
const userModel_1 = require("../../models/userModel");
const mongoose_1 = __importDefault(require("mongoose"));
const eventsModel_1 = require("../../models/eventsModel");
const performerModel_1 = require("../../models/performerModel");
const bookingEvents_1 = require("../../models/bookingEvents");
const adminModel_1 = require("../../models/adminModel");
const walletHistory_1 = require("../../models/walletHistory");
const slotModel_1 = require("../../models/slotModel");
const FavoriteScema_1 = require("../../models/FavoriteScema");
const ratingModel_1 = require("../../models/ratingModel");
class userEventRepository {
    constructor() {
        this.getEvent = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return eventsModel_1.EventModel.findById(eventId);
            }
            catch (error) {
                throw error;
            }
        });
        this.getPerformerEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const events = yield eventsModel_1.EventModel.find({
                    userId: id,
                    isperformerblockedevents: false,
                    isblocked: false
                });
                return events;
            }
            catch (error) {
                throw error;
            }
        });
        this.getPerformer = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield performerModel_1.PerformerModel.findOne({ userId: id });
        });
        this.getTopRatedEvent = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allEvents = yield eventsModel_1.EventModel.find({
                    isblocked: false,
                    isperformerblockedevents: false,
                    userId: { $ne: userId },
                });
                const validEvents = [];
                for (const event of allEvents) {
                    const performer = yield userModel_1.UserModel.findById(event.userId);
                    if (performer && !performer.isPerformerBlocked) {
                        validEvents.push(event);
                    }
                }
                validEvents.sort((a, b) => b.rating - a.rating);
                return validEvents.slice(0, 3);
            }
            catch (error) {
                console.error("Error fetching top-rated events:", error);
                return null;
            }
        });
        this.favaroiteEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const favoriteEvents = yield FavoriteScema_1.FavoriteModel.find({ userId: id }).sort({
                    _id: -1,
                });
                const totalEvent = yield FavoriteScema_1.FavoriteModel.countDocuments({ userId: id });
                const eventIds = favoriteEvents.map((favorite) => favorite.eventId);
                const events = yield eventsModel_1.EventModel.find({ _id: { $in: eventIds } });
                return { totalEvent, events };
            }
            catch (error) {
                console.error("Error fetching favorite events:", error);
                throw error;
            }
        });
        this.getUpcomingEvents = (userId, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const pageSize = 8;
                const skip = (page - 1) * pageSize;
                const matchQuery = {
                    userId: userId,
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
                    .populate("performerId", "name")
                    .lean();
                const upcomingEvents = bookings.map((booking) => {
                    const event = booking.eventId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
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
                        isRated: booking.isRated,
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
        this.getAllEventHistory = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const matchQuery = { userId: id, date: { $lt: currentDate } };
                const totalCount = yield bookingEvents_1.BookingModel.countDocuments(matchQuery);
                const bookings = yield bookingEvents_1.BookingModel.find(matchQuery)
                    .sort({ date: -1 })
                    .limit(8)
                    .populate({
                    path: "eventId",
                    model: "Event",
                    select: "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
                })
                    .populate("performerId", "name")
                    .lean();
                const pastEventHistory = bookings.map((booking) => {
                    const event = booking.eventId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
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
                        isRated: booking.isRated,
                        createdAt: booking.createdAt,
                        updatedAt: booking.updatedAt,
                        title: event.title,
                        category: event.category,
                    };
                });
                return { totalCount, pastEventHistory };
            }
            catch (error) {
                console.error("Error in getAllEventHistory:", error);
                throw error;
            }
        });
        this.userWalletBookEvent = (formData, eventId, performerId, userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield eventsModel_1.EventModel.findById(eventId);
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: performerId });
                if (!event) {
                    throw new Error("Event not found");
                }
                if (!performer) {
                    throw new Error("Performer not found");
                }
                const performerBookingDate = yield bookingEvents_1.BookingModel.find({
                    performerId: performer._id,
                    date: formData.date,
                });
                if (performerBookingDate.length > 0) {
                    return null;
                }
                const slotDocument = yield slotModel_1.SlotModel.findOne({
                    performerId: performer._id,
                });
                if (slotDocument && Array.isArray(slotDocument.dates)) {
                    const inputDateString = new Date(formData.date)
                        .toISOString()
                        .split("T")[0];
                    const isDateExist = slotDocument.dates.some((date) => {
                        const slotDateString = new Date(date).toISOString().split("T")[0];
                        return slotDateString === inputDateString;
                    });
                    if (isDateExist) {
                        return null;
                    }
                }
                const price = event.price;
                const advancePayment = (price * 10) / 100 - 10;
                const restPayment = price - (price * 10) / 100;
                const bookEvent = yield bookingEvents_1.BookingModel.create({
                    eventId: event._id,
                    performerId: performer._id,
                    userId: userId,
                    price: price,
                    advancePayment: advancePayment,
                    restPayment: restPayment,
                    time: formData.time,
                    place: formData.place,
                    date: formData.date,
                });
                const currentDate = new Date().toISOString().split("T")[0];
                yield adminModel_1.AdminModel.updateOne({}, {
                    $inc: { [`transactions.${currentDate}`]: 1, walletAmount: 10 },
                }, { upsert: true });
                yield userModel_1.UserModel.findByIdAndUpdate(userId, {
                    $inc: { walletBalance: -advancePayment },
                });
                const performerUserId = performer.userId;
                yield userModel_1.UserModel.findByIdAndUpdate(performerUserId, {
                    $inc: { walletBalance: advancePayment },
                });
                const userWalletEntry = new walletHistory_1.WalletModel({
                    userId,
                    amount: -advancePayment,
                    transactionType: "debit",
                    role: "user",
                    date: new Date(),
                    description: "Advance payment for event booking",
                });
                yield userWalletEntry.save();
                const performerWalletEntry = new walletHistory_1.WalletModel({
                    userId: performerUserId,
                    amount: advancePayment,
                    transactionType: "credit",
                    role: "performer",
                    date: new Date(),
                    description: "Advance payment received for event booking",
                });
                yield performerWalletEntry.save();
                return bookEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.userBookEvent = (formData, eventId, performerId, userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield eventsModel_1.EventModel.findById(eventId);
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: performerId });
                if (!event) {
                    throw new Error("Event not found");
                }
                if (!performer) {
                    throw new Error("Performer not found");
                }
                const performerBookingDate = yield bookingEvents_1.BookingModel.find({
                    performerId: performer._id,
                    date: formData.date,
                });
                if (performerBookingDate.length > 0) {
                    return null;
                }
                const slotDocument = yield slotModel_1.SlotModel.findOne({
                    performerId: performer._id,
                });
                if (slotDocument && Array.isArray(slotDocument.dates)) {
                    const inputDateString = new Date(formData.date)
                        .toISOString()
                        .split("T")[0];
                    const isDateExist = slotDocument.dates.some((date) => {
                        const slotDateString = new Date(date).toISOString().split("T")[0];
                        return slotDateString === inputDateString;
                    });
                    if (isDateExist) {
                        return null;
                    }
                }
                else {
                    console.log("SlotDocument not found or does not have a valid dates array");
                }
                const price = event.price;
                const advancePayment = (price * 10) / 100 - 10;
                const restPayment = price - (price * 10) / 100;
                const bookEvent = yield bookingEvents_1.BookingModel.create({
                    eventId: event._id,
                    performerId: performer._id,
                    userId: userId,
                    price: price,
                    advancePayment: advancePayment,
                    restPayment: restPayment,
                    time: formData.time,
                    place: formData.place,
                    date: formData.date,
                });
                const currentDate = new Date().toISOString().split("T")[0];
                yield adminModel_1.AdminModel.updateOne({}, {
                    $inc: { [`transactions.${currentDate}`]: 1, walletAmount: 10 },
                }, { upsert: true });
                return bookEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.getEventHistory = (userId, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const pageSize = 8;
                const skip = (page - 1) * pageSize;
                const matchQuery = { userId: userId, date: { $lt: currentDate } };
                const totalCount = yield bookingEvents_1.BookingModel.countDocuments(matchQuery);
                const bookings = yield bookingEvents_1.BookingModel.find(matchQuery)
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(pageSize)
                    .populate({
                    path: "eventId",
                    model: "Event",
                    select: "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
                })
                    .populate("performerId", "name")
                    .lean();
                const pastEventHistory = bookings.map((booking) => {
                    const event = booking.eventId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
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
                        isRated: booking.isRated,
                        createdAt: booking.createdAt,
                        updatedAt: booking.updatedAt,
                        title: event.title,
                        category: event.category,
                    };
                });
                return { totalCount, pastEventHistory };
            }
            catch (error) {
                console.error("Error in getEventHistory:", error);
                throw error;
            }
        });
        this.getFilteredEvents = (id, filterOptions, sortOptions, skip, limit) => __awaiter(this, void 0, void 0, function* () {
            try {
                const totalCount = yield eventsModel_1.EventModel.countDocuments(Object.assign({ isblocked: false, isperformerblockedevents: false, userId: { $ne: id } }, filterOptions));
                const allFilteredEvents = yield eventsModel_1.EventModel.find(Object.assign({ isblocked: false, isperformerblockedevents: false, userId: { $ne: id } }, filterOptions))
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit);
                const validEvents = [];
                for (const event of allFilteredEvents) {
                    const performer = yield userModel_1.UserModel.findById(event.userId);
                    if (performer && !performer.isPerformerBlocked) {
                        validEvents.push(event);
                    }
                }
                return { events: validEvents, totalCount };
            }
            catch (error) {
                console.error("Error fetching filtered events:", error);
                return null;
            }
        });
        this.toggleFavoriteEvent = (userId, eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the favorite event already exists
                const existingFavorite = yield FavoriteScema_1.FavoriteModel.findOne({ userId, eventId });
                if (existingFavorite) {
                    yield FavoriteScema_1.FavoriteModel.deleteOne({ userId, eventId });
                    return null;
                }
                else {
                    const newFavorite = yield FavoriteScema_1.FavoriteModel.create({ userId, eventId });
                    return newFavorite;
                }
            }
            catch (error) {
                throw error;
            }
        });
        this.ratingAdded = (bookingId, rating, review) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingevent = yield bookingEvents_1.BookingModel.findByIdAndUpdate(bookingId, { isRated: true }, { new: true });
                const eventId = bookingevent === null || bookingevent === void 0 ? void 0 : bookingevent.eventId;
                if (!eventId) {
                    console.error("Event ID not found in booking");
                    return null;
                }
                const event = yield eventsModel_1.EventModel.findById(eventId);
                if (!event) {
                    console.error("Event not found");
                    return null;
                }
                const ratingDoc = new ratingModel_1.RatingModel({
                    eventId: eventId,
                    userId: bookingevent.userId,
                    rating: rating,
                    review: review,
                });
                yield ratingDoc.save();
                const totalRating = event.rating * event.totalReviews + rating;
                const newRatedCount = event.totalReviews + 1;
                const newAverageRating = totalRating / newRatedCount;
                event.rating = newAverageRating;
                event.totalReviews = newRatedCount;
                yield event.save();
                const userId = event.userId;
                if (userId) {
                    const performer = yield performerModel_1.PerformerModel.findOne({ userId });
                    if (performer) {
                        const totalPerformerRating = performer.rating * performer.totalReviews + rating;
                        const newTotalReviews = performer.totalReviews + 1;
                        const newPerformerAverageRating = totalPerformerRating / newTotalReviews;
                        performer.rating = newPerformerAverageRating;
                        performer.totalReviews = newTotalReviews;
                        yield performer.save();
                    }
                    else {
                        console.error("Performer not found for userId:", userId);
                    }
                }
                return event;
            }
            catch (error) {
                console.error("Error in ratingAdded:", error);
                throw error;
            }
        });
        this.getEventRating = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ratings = yield ratingModel_1.RatingModel.find({ eventId })
                    .sort({ _id: -1 })
                    .limit(50)
                    .populate('userId', 'username profileImage')
                    .lean();
                const eventRatings = ratings.map((rating) => ({
                    userName: rating.userId.username,
                    profilePicture: rating.userId.profileImage,
                    rating: rating.rating,
                    review: rating.review,
                    Date: rating.createdAt,
                }));
                return eventRatings;
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllUpcomingEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const currentDate = new Date();
                const matchQuery = {
                    userId: id,
                    date: { $gte: currentDate },
                };
                const totalCount = yield bookingEvents_1.BookingModel.countDocuments(matchQuery);
                const bookings = yield bookingEvents_1.BookingModel.find(matchQuery)
                    .sort({ date: 1 })
                    .limit(8)
                    .populate({
                    path: "eventId",
                    model: "Event",
                    select: "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
                })
                    .populate("performerId", "name")
                    .lean();
                const upcomingEvents = bookings.map((booking) => {
                    console.log('bddfasdfafdsdas', booking);
                    const event = booking.eventId;
                    return {
                        _id: booking._id,
                        eventId: booking.eventId,
                        performerId: booking.performerId,
                        userId: booking.userId,
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
                        isRated: booking.isRated,
                        createdAt: booking.createdAt,
                        updatedAt: booking.updatedAt,
                        title: event.title,
                        category: event.category,
                    };
                });
                return { totalCount, upcomingEvents };
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
                const { userId, performerId, advancePayment } = event;
                if (!userId) {
                    return null;
                }
                if (dateDifferenceInDays > 9) {
                    yield userModel_1.UserModel.findByIdAndUpdate(userId, {
                        $inc: { walletBalance: advancePayment },
                    });
                    const walletEntry = new walletHistory_1.WalletModel({
                        userId,
                        amount: advancePayment,
                        transactionType: "credit",
                        role: "user",
                        date: today,
                        description: "event booking cancelled ",
                    });
                    yield walletEntry.save();
                    event.bookingStatus = "canceled";
                    const updatedEvent = yield event.save();
                    return updatedEvent;
                }
                if (dateDifferenceInDays < 0) {
                    return null;
                }
                const performer = yield performerModel_1.PerformerModel.findById(performerId);
                if (!performer) {
                    return null;
                }
                const performerUserId = performer.userId;
                yield userModel_1.UserModel.findByIdAndUpdate(performerUserId, {
                    $inc: { walletBalance: advancePayment },
                });
                const performerWalletEntry = new walletHistory_1.WalletModel({
                    userId: performerUserId,
                    amount: advancePayment,
                    transactionType: "credit",
                    role: "performer",
                    date: today,
                    description: "user cancelled event",
                });
                yield performerWalletEntry.save();
                event.bookingStatus = "canceled";
                const updatedEvent = yield event.save();
                return updatedEvent;
            }
            catch (error) {
                console.error("Error canceling event:", error);
                throw error;
            }
        });
        this.getAllEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allEvents = yield eventsModel_1.EventModel.find({
                    isblocked: false,
                    isperformerblockedevents: false,
                    userId: { $ne: id },
                });
                const validEvents = [];
                for (const event of allEvents) {
                    const performer = yield userModel_1.UserModel.findById(event.userId);
                    if (performer && !performer.isPerformerBlocked) {
                        validEvents.push(event);
                    }
                }
                return validEvents;
            }
            catch (error) {
                console.error("Error fetching events:", error);
                return null;
            }
        });
        this.getFilteredPerformers = (id_1, filterOptions_1, ...args_1) => __awaiter(this, [id_1, filterOptions_1, ...args_1], void 0, function* (id, filterOptions, sortOptions = { rating: -1 }, skip, limit) {
            try {
                const userId = typeof id === "string" ? new mongoose_1.default.Types.ObjectId(id) : id;
                console.log('repo', filterOptions, sortOptions);
                const blockedUsers = yield userModel_1.UserModel.find({ isPerformerBlocked: true }, { _id: 1 });
                const blockedUserIds = blockedUsers.map((user) => user._id);
                const combinedFilter = {
                    userId: {
                        $ne: userId,
                        $nin: blockedUserIds,
                    },
                };
                if (filterOptions) {
                    if (filterOptions.search) {
                        const searchStr = filterOptions.search.trim();
                        combinedFilter.$or = [
                            { bandName: { $regex: searchStr, $options: "i" } },
                            { place: { $regex: searchStr, $options: "i" } },
                        ];
                    }
                    else if (filterOptions.$or) {
                        combinedFilter.$or = filterOptions.$or;
                    }
                }
                console.log("Final Combined Filter:", JSON.stringify(combinedFilter, null, 2));
                console.log("Executing count query...");
                const totalCount = yield performerModel_1.PerformerModel.countDocuments(combinedFilter);
                console.log("Total Count:", totalCount);
                console.log("Executing find query...");
                const performers = yield performerModel_1.PerformerModel.find(combinedFilter)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .select("userId bandName description profileImage place rating");
                console.log("Found Performers Count:", performers.length);
                if (performers.length > 0) {
                    console.log("Sample Found Performer:", performers[0]);
                }
                if (!performers.length) {
                    return null;
                }
                return { performers, totalCount };
            }
            catch (error) {
                console.error("Error in getFilteredPerformers:", error);
                throw error;
            }
        });
        this.availableDate = (formData, eventId, performerId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: performerId });
                if (!performer) {
                    throw new Error("Performer not found");
                }
                const existingBooking = yield bookingEvents_1.BookingModel.findOne({
                    performerId: performer._id,
                    date: formData.date,
                });
                if (existingBooking) {
                    return false;
                }
                const slotDocument = yield slotModel_1.SlotModel.findOne({
                    performerId: performer._id,
                });
                if (slotDocument && Array.isArray(slotDocument.dates)) {
                    const inputDate = new Date(formData.date).setHours(0, 0, 0, 0);
                    const isDateExist = slotDocument.dates.some((date) => {
                        const slotDate = new Date(date).setHours(0, 0, 0, 0);
                        return slotDate === inputDate;
                    });
                    if (isDateExist) {
                        return false;
                    }
                }
                return true;
            }
            catch (error) {
                console.error("Error checking availability:", error);
                throw error;
            }
        });
        this.getAllPerformer = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performers = yield performerModel_1.PerformerModel.find({ userId: { $ne: id } });
                return performers;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.userEventRepository = userEventRepository;
