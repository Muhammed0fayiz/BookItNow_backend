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
exports.adminUseCase = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const userModel_1 = require("../../../infrastructure/models/userModel");
class adminUseCase {
    constructor(repository) {
        this.repository = repository;
        this.getRevenue = (offset, pageSize) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getRevenue(offset, pageSize);
            }
            catch (error) {
                throw error;
            }
        });
        this.getAdminDetails = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const adminDetail = yield this._repository.getAdminDetails();
                return adminDetail;
            }
            catch (error) {
                throw error;
            }
        });
        this.getReport = (startdate, endingdate) => __awaiter(this, void 0, void 0, function* () {
            const report = yield this._repository.getReport(startdate, endingdate);
            return report;
        });
        this.adminWallet = () => __awaiter(this, void 0, void 0, function* () {
            const adminWallet = yield this._repository.adminWallet();
            return adminWallet;
        });
        this.getTempPerformer = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getTempPerformer();
            }
            catch (error) {
                throw error;
            }
        });
        this.grantedPermission = (id) => __awaiter(this, void 0, void 0, function* () {
            const performer = yield this._repository.grantedPermission(id);
            if (performer) {
                const user = yield userModel_1.UserModel.findById(performer.userId);
                if (user) {
                    try {
                        yield this.sendCongratulatoryEmail(user.email);
                    }
                    catch (error) {
                        console.error("Error sending congratulatory email:", error);
                    }
                }
            }
            return performer;
        });
        this.sendCongratulatoryEmail = (email) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Sending congratulatory email...");
                const sendEmail = (email) => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        const transporter = nodemailer_1.default.createTransport({
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
                            }
                            else {
                                resolve(info.response);
                                console.log("Congratulatory mail sent.");
                            }
                        });
                    });
                });
                const mailSent = yield sendEmail(email);
                return mailSent;
            }
            catch (error) {
                console.error("Error in sending congratulatory mail:", error);
                throw error;
            }
        });
        this.rejectedPermission = (id, rejectReason) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tempPerformer = yield this._repository.rejectedPermission(id);
                if (tempPerformer) {
                    const user = yield userModel_1.UserModel.findById(tempPerformer.user_id);
                    if (user) {
                        try {
                            yield this.sendRejectionEmail(user.email, rejectReason);
                        }
                        catch (error) {
                            console.error("Error sending rejection email:", error);
                        }
                    }
                }
                return tempPerformer;
            }
            catch (error) {
                throw error;
            }
        });
        this.sendRejectionEmail = (email, rejectReason) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Sending rejection email...");
                const sendEmail = (email, rejectReason) => __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        const transporter = nodemailer_1.default.createTransport({
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
                            }
                            else {
                                resolve(info.response);
                                console.log("Rejection mail sent.");
                            }
                        });
                    });
                });
                const mailSent = yield sendEmail(email, rejectReason);
                return mailSent;
            }
            catch (error) {
                console.error("Error in sending rejection mail:", error);
                throw error;
            }
        });
        this.getAllPerformer = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getAllPerformer();
            }
            catch (error) {
                throw error;
            }
        });
        this.performerStatusChange = (id, isblocked, isverified) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.performerStatusChange(id, isblocked, isverified);
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllUser = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getAllUser();
            }
            catch (error) {
                throw error;
            }
        });
        this.userStatusChange = (id, isblocked) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.userStatusChange(id, isblocked);
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllEvents = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.getAllEvents();
            }
            catch (error) {
                throw error;
            }
        });
        this.toggleBlockStatus = (id, blockingDetails) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('hari', blockingDetails === null || blockingDetails === void 0 ? void 0 : blockingDetails.reason, blockingDetails === null || blockingDetails === void 0 ? void 0 : blockingDetails.duration);
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
                return yield this._repository.toggleBlockStatus(id, blockingDetails);
            }
            catch (error) {
                console.error("Error in toggleBlockStatus use case:", error);
                throw error;
            }
        });
        this._repository = repository;
    }
}
exports.adminUseCase = adminUseCase;
