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
exports.adminRepository = void 0;
const userModel_1 = require("../../models/userModel");
const tempPerformer_1 = require("../../models/tempPerformer");
const performerModel_1 = require("../../models/performerModel");
const eventsModel_1 = require("../../models/eventsModel");
const adminModel_1 = require("../../models/adminModel");
const bookingEvents_1 = require("../../models/bookingEvents");
// Interface for populated booking
class adminRepository {
    constructor() {
        this.getRevenue = (offset, pageSize) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield bookingEvents_1.BookingModel.find()
                    .skip(offset)
                    .limit(pageSize)
                    .sort({ _id: -1 })
                    .populate('eventId');
                const totalCount = yield bookingEvents_1.BookingModel.countDocuments();
                const adminRevinue = [];
                for (const booking of bookings) {
                    const performer = yield performerModel_1.PerformerModel.findById(booking.performerId);
                    const user = yield userModel_1.UserModel.findById(booking.userId);
                    if (user && performer && booking.eventId) {
                        adminRevinue.push({
                            userName: user.username,
                            performerName: performer.bandName,
                            eventName: booking.eventId.title,
                            status: booking.bookingStatus,
                            place: booking.place,
                            date: booking.createdAt.toISOString(),
                        });
                    }
                }
                return {
                    totalCount,
                    adminRevinue,
                };
            }
            catch (error) {
                throw error;
            }
        });
        this.getAdminDetails = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const admin = yield adminModel_1.AdminModel.findOne();
                let walletAmount = 0;
                let walletTransactionHistory = {};
                if (admin) {
                    walletAmount = admin.walletAmount;
                    walletTransactionHistory = admin.transactions;
                }
                const performers = yield performerModel_1.PerformerModel.find()
                    .populate('userId', 'createdAt');
                const users = yield userModel_1.UserModel.find();
                const performerRegistrationHistory = {};
                performers.forEach((performer) => {
                    var _a;
                    if ((_a = performer.userId) === null || _a === void 0 ? void 0 : _a.createdAt) {
                        const createdAt = performer.userId.createdAt;
                        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
                        performerRegistrationHistory[day] =
                            (performerRegistrationHistory[day] || 0) + 1;
                    }
                });
                const userRegistrationHistory = {};
                users.forEach(({ createdAt }) => {
                    if (createdAt) {
                        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
                        userRegistrationHistory[day] =
                            (userRegistrationHistory[day] || 0) + 1;
                    }
                });
                return {
                    walletAmount: walletAmount,
                    walletTransactionHistory: walletTransactionHistory,
                    totalUsers: users.length,
                    totalPerformers: performers.length,
                    userRegistrationHistory: userRegistrationHistory,
                    performerRegistrationHistory: performerRegistrationHistory,
                };
            }
            catch (error) {
                console.error("Error fetching admin details:", error);
                throw error;
            }
        });
        this.getReport = (startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Fetching report for date range...", startDate, endDate);
                const adjustedEndDate = new Date(endDate);
                adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
                const admin = yield adminModel_1.AdminModel.findOne();
                let walletAmount = 0;
                let walletTransactionHistory = {};
                if (admin) {
                    walletAmount = admin.walletAmount;
                    walletTransactionHistory = admin.transactions;
                }
                const performers = yield performerModel_1.PerformerModel.find({
                    createdAt: { $gte: startDate, $lt: adjustedEndDate },
                });
                const users = yield userModel_1.UserModel.find({
                    createdAt: { $gte: startDate, $lt: adjustedEndDate },
                });
                const performerRegistrationHistory = {};
                performers.forEach(({ createdAt }) => {
                    if (createdAt &&
                        createdAt >= startDate &&
                        createdAt < adjustedEndDate) {
                        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
                        performerRegistrationHistory[day] =
                            (performerRegistrationHistory[day] || 0) + 1;
                    }
                });
                const userRegistrationHistory = {};
                users.forEach(({ createdAt }) => {
                    if (createdAt &&
                        createdAt >= startDate &&
                        createdAt < adjustedEndDate) {
                        const day = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(createdAt.getDate()).padStart(2, "0")}`;
                        userRegistrationHistory[day] =
                            (userRegistrationHistory[day] || 0) + 1;
                    }
                });
                return {
                    walletAmount: walletAmount,
                    walletTransactionHistory: walletTransactionHistory,
                    totalUsers: users.length,
                    totalPerformers: performers.length,
                    userRegistrationHistory: userRegistrationHistory,
                    performerRegistrationHistory: performerRegistrationHistory,
                };
            }
            catch (error) {
                console.error("Error fetching report details:", error);
                throw error;
            }
        });
        this.getTempPerformer = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const tmp = yield tempPerformer_1.TempPerformerModel.find().sort({ _id: -1 });
                if (tmp) {
                    return tmp;
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.grantedPermission = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tempPerform = yield tempPerformer_1.TempPerformerModel.findById(id);
                if (!tempPerform) {
                    throw new Error("Temporary performer not found");
                }
                const user = yield userModel_1.UserModel.findByIdAndUpdate(tempPerform.user_id, { isVerified: true, waitingPermission: false }, { new: true });
                if (!user) {
                    throw new Error("User not found");
                }
                const newPerformer = yield performerModel_1.PerformerModel.create({
                    userId: user._id,
                    bandName: tempPerform.bandName,
                    mobileNumber: tempPerform.mobileNumber,
                    description: tempPerform.description,
                    rating: 0,
                });
                yield tempPerformer_1.TempPerformerModel.findByIdAndDelete(id);
                return newPerformer;
            }
            catch (error) {
                throw error;
            }
        });
        this.rejectedPermission = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tempPerform = (yield tempPerformer_1.TempPerformerModel.findByIdAndDelete(id));
                if (!tempPerform) {
                    throw new Error("Performer not found");
                }
                yield userModel_1.UserModel.findByIdAndUpdate(tempPerform.user_id, {
                    waitingPermission: false,
                });
                return tempPerform;
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllPerformer = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const performers = yield performerModel_1.PerformerModel.find().sort({ _id: -1 });
                ;
                return performers;
            }
            catch (error) {
                throw error;
            }
        });
        this.performerStatusChange = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performer = yield userModel_1.UserModel.findById(id).lean().exec();
                if (!performer) {
                    throw new Error("User not found");
                }
                const updatedIsPerformerBlocked = !performer.isPerformerBlocked;
                const updatedUser = yield userModel_1.UserModel.findByIdAndUpdate(id, { isPerformerBlocked: updatedIsPerformerBlocked }, { new: true })
                    .lean()
                    .exec();
                if (!updatedUser) {
                    throw new Error("User not found after update");
                }
                return updatedUser;
            }
            catch (error) {
                console.error("Error in performerStatusChange:", error);
                throw error;
            }
        });
        this.getAllUser = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_1.UserModel.find().sort({ _id: -1 }).lean();
                return users.map((user) => (Object.assign(Object.assign({}, user), { _id: user._id.toString() })));
            }
            catch (error) {
                console.error("Error fetching users:", error);
                return [];
            }
        });
        this.userStatusChange = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = (yield userModel_1.UserModel.findById(id).exec());
                if (!user) {
                    throw new Error("User not found");
                }
                user.isblocked = !user.isblocked;
                const updatedUser = yield userModel_1.UserModel.findByIdAndUpdate(id, { isblocked: user.isblocked }, { new: true })
                    .lean()
                    .exec();
                if (!updatedUser) {
                    throw new Error("User not found");
                }
                return updatedUser;
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllEvents = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const allEvents = yield eventsModel_1.EventModel.find().sort({ _id: -1 });
                return allEvents;
            }
            catch (error) {
                console.error("Error fetching events:", error);
                return null;
            }
        });
        this.toggleBlockStatus = (id, blockingDetails) => __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield eventsModel_1.EventModel.findById(id);
                if (!event)
                    return null;
                event.isblocked = !event.isblocked;
                if (event.isblocked && blockingDetails) {
                    const { reason, duration } = blockingDetails;
                    const blockingEndDate = new Date();
                    switch (duration) {
                        case '1week':
                            blockingEndDate.setDate(blockingEndDate.getDate() + 7);
                            break;
                        case '1month':
                            blockingEndDate.setMonth(blockingEndDate.getMonth() + 1);
                            break;
                        case '1year':
                            blockingEndDate.setFullYear(blockingEndDate.getFullYear() + 1);
                            break;
                        case '10year':
                            blockingEndDate.setFullYear(blockingEndDate.getFullYear() + 10);
                            break;
                        default:
                            throw new Error('Invalid blocking duration');
                    }
                    event.blockingReason = reason;
                    event.blockingPeriod = blockingEndDate;
                }
                else {
                    event.blockingReason = "";
                    event.blockingPeriod = null;
                }
                const updatedEvent = yield event.save();
                return updatedEvent;
            }
            catch (error) {
                console.error("Error toggling block status:", error);
                throw error;
            }
        });
    }
    adminWallet() {
        throw new Error("Method not implemented.");
    }
}
exports.adminRepository = adminRepository;
