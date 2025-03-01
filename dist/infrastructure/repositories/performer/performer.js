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
exports.performerRepository = void 0;
const slotModel_1 = require("../../models/slotModel");
const performerModel_1 = require("../../models/performerModel");
const userModel_1 = require("../../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tempPerformer_1 = require("../../models/tempPerformer");
const eventsModel_1 = require("../../models/eventsModel");
const bookingEvents_1 = require("../../models/bookingEvents");
const walletHistory_1 = require("../../models/walletHistory");
class performerRepository {
    constructor() {
        this.getReport = (performerId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performer = yield userModel_1.UserModel.findById(performerId);
                if (!performer)
                    throw new Error("Performer not found");
                const performerDetails = yield performerModel_1.PerformerModel.findOne({
                    userId: performerId,
                });
                if (!performerDetails)
                    throw new Error("Performer details not found");
                const totalPrograms = yield eventsModel_1.EventModel.countDocuments({
                    userId: performerId,
                });
                const bookings = yield bookingEvents_1.BookingModel.find({
                    performerId: performerDetails._id,
                    date: { $gte: startDate, $lte: endDate },
                }).populate("eventId");
                const totalEventsHistory = {};
                const performerRegistrationHistory = {};
                const upcomingEvent = [];
                const eventHistory = [];
                console.log(totalEventsHistory);
                for (const booking of bookings) {
                    const event = booking.eventId;
                    if (booking.bookingStatus === "completed") {
                        eventHistory.push({
                            title: event.title,
                            date: booking.date,
                            place: booking.place,
                            price: event.price,
                            rating: event.rating,
                            teamLeadername: event.teamLeader,
                            teamLeaderNumber: event.teamLeaderNumber,
                            category: event.category,
                            status: booking.bookingStatus,
                        });
                    }
                    if (booking.date > new Date()) {
                        upcomingEvent.push({
                            title: event.title,
                            date: booking.date,
                            place: booking.place,
                            price: event.price,
                            rating: event.rating,
                            teamLeadername: event.teamLeader,
                            teamLeaderNumber: event.teamLeaderNumber,
                            category: event.category,
                            status: booking.bookingStatus,
                        });
                    }
                    const month = booking.date.toISOString().slice(0, 7);
                    performerRegistrationHistory[month] =
                        (performerRegistrationHistory[month] || 0) + 1;
                }
                return {
                    totalPrograms: totalPrograms || 0,
                    upcomingEvent,
                    eventHistory,
                };
            }
            catch (error) {
                console.error("Error fetching performer details:", error);
                throw new Error(`Error fetching performer details:`);
            }
        });
        this.loginPerformer = (email, password) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const performer = yield userModel_1.UserModel.findOne({ email: email });
                if (!performer) {
                    return null;
                }
                else if (performer.isPerformerBlocked) {
                    return "Performer is Blocked";
                }
                else if (!performer.isVerified) {
                    return "Performer is not Verified";
                }
                const isMatch = yield bcrypt_1.default.compare(password, performer.password);
                if (!isMatch) {
                    return null;
                }
                return {
                    username: performer.username,
                    email: performer.email,
                    password: performer.password,
                    _id: (_a = performer._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    isVerified: performer.isVerified,
                    isPerformerBlocked: performer.isPerformerBlocked,
                };
            }
            catch (error) {
                throw error;
            }
        });
        this.getPerformerDetails = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performer = yield performerModel_1.PerformerModel.findOne({ userId }).lean().exec();
                if (!performer)
                    throw new Error("Performer not found");
                return performer;
            }
            catch (error) {
                console.error("Error occurred while finding performer:", error);
                return null;
            }
        });
        this.videoUploadDB = (bandName, mobileNumber, description, user_id, s3Location) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield userModel_1.UserModel.findByIdAndUpdate(user_id, {
                    waitingPermission: true,
                });
                const newTempPerformer = new tempPerformer_1.TempPerformerModel({
                    bandName: bandName,
                    mobileNumber: mobileNumber,
                    video: s3Location,
                    description: description,
                    user_id: user_id,
                });
                const savedTempPerformer = yield newTempPerformer.save();
                return savedTempPerformer;
            }
            catch (error) {
                console.error("Error occurred while creating temp performer:", error);
                return null;
            }
        });
        this.getAllUsers = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.UserModel.find({ _id: { $ne: id } });
                return users;
            }
            catch (error) {
                throw error;
            }
        });
        this.performerAllDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performer = yield userModel_1.UserModel.findById(id);
                if (!performer)
                    throw new Error("Performer not found");
                const performerDetails = yield performerModel_1.PerformerModel.findOne({ userId: id });
                if (!performerDetails)
                    throw new Error("Performer details not found");
                yield bookingEvents_1.BookingModel.find({ userId: performerDetails === null || performerDetails === void 0 ? void 0 : performerDetails._id });
                const totalEvents = yield bookingEvents_1.BookingModel.find({
                    performerId: performerDetails._id,
                }).countDocuments();
                const userWallet = yield walletHistory_1.WalletModel.find({ userId: id });
                const walletAmount = userWallet.reduce((total, wallet) => total + wallet.amount, 0);
                const walletTransactionHistory = userWallet.reduce((history, wallet) => (Object.assign(Object.assign({}, history), { [wallet.date.toISOString()]: wallet.amount })), {});
                const totalPrograms = yield eventsModel_1.EventModel.countDocuments({ userId: id });
                const upcomingEventsPipeline = [
                    {
                        $match: {
                            performerId: performerDetails._id,
                            bookingStatus: { $nin: ["canceled", "completed"] },
                        },
                    },
                    {
                        $project: {
                            formattedDate: {
                                $dateToString: { format: "%Y-%m", date: "$date" },
                            },
                            count: 1,
                        },
                    },
                    {
                        $group: {
                            _id: "$formattedDate",
                            count: { $sum: 1 },
                        },
                    },
                ];
                const upcomingEventsResult = yield bookingEvents_1.BookingModel.aggregate(upcomingEventsPipeline);
                const upcomingEvents = upcomingEventsResult.reduce((events, item) => (Object.assign(Object.assign({}, events), { [item._id]: item.count })), {});
                const totalEventsHistoryPipeline = [
                    {
                        $match: {
                            performerId: performerDetails._id,
                            bookingStatus: "completed",
                        },
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%d/%m/%Y", date: "$date" } }, // Use '%Y' for the year
                            count: { $sum: 1 },
                        },
                    },
                ];
                const totalEventsHistoryResult = yield bookingEvents_1.BookingModel.aggregate(totalEventsHistoryPipeline);
                const totalEventsHistory = totalEventsHistoryResult.reduce((history, item) => (Object.assign(Object.assign({}, history), { [item._id]: item.count })), {});
                return {
                    walletAmount,
                    walletTransactionHistory,
                    totalEvent: totalEvents,
                    totalPrograms,
                    totalEventsHistory,
                    upcomingEvents,
                    totalReviews: performerDetails.totalReviews || 0,
                };
            }
            catch (error) {
                console.error("Error fetching performer details:", error);
                throw new Error(`Error fetching performer details:}`);
            }
        });
        this.slotDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: id });
                if (!performer) {
                    throw new Error("Performer not found");
                }
                const performerId = performer._id;
                const performerSlot = yield slotModel_1.SlotModel.findOne({
                    performerId: performerId,
                });
                const bookingEvents = yield bookingEvents_1.BookingModel.find({
                    performerId: performerId,
                    bookingStatus: { $ne: "canceled" },
                });
                const bookingDates = bookingEvents.map((event) => event.date);
                let unavailableDates = [];
                if (performerSlot) {
                    unavailableDates = performerSlot.dates.filter((date) => !bookingDates.some((bookingDate) => bookingDate.getTime() === date.getTime()));
                }
                const slotManagement = {
                    bookingDates: bookingDates,
                    unavailableDates: unavailableDates,
                };
                return slotManagement;
            }
            catch (error) {
                console.error("Error fetching slot details:", error);
                throw error;
            }
        });
        this.updateslot = (id, date) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id || !date) {
                    throw new Error("User ID and date are required");
                }
                const performer = yield performerModel_1.PerformerModel.findOne({ userId: id });
                if (!performer) {
                    throw new Error("Performer not found");
                }
                const performerId = performer._id;
                const existingBooking = yield bookingEvents_1.BookingModel.findOne({
                    performerId,
                    date: {
                        $gte: new Date(date.setHours(0, 0, 0, 0)),
                        $lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                    bookingStatus: { $ne: "canceled" },
                });
                if (existingBooking) {
                    return "Slot already booked for this date";
                }
                let slotDocument = yield slotModel_1.SlotModel.findOne({ performerId });
                if (!slotDocument) {
                    slotDocument = new slotModel_1.SlotModel({
                        performerId,
                        dates: [new Date(date.setHours(0, 0, 0, 0))],
                    });
                    return yield slotDocument.save();
                }
                const normalizedDate = new Date(date.setHours(0, 0, 0, 0));
                const dateIndex = slotDocument.dates.findIndex((existingDate) => existingDate.toISOString().split("T")[0] ===
                    normalizedDate.toISOString().split("T")[0]);
                if (dateIndex !== -1) {
                    slotDocument.dates.splice(dateIndex, 1);
                }
                else {
                    slotDocument.dates.push(normalizedDate);
                }
                return yield slotDocument.save();
            }
            catch (error) {
                console.error("Error in updateSlot:", error);
                throw error;
            }
        });
    }
}
exports.performerRepository = performerRepository;
