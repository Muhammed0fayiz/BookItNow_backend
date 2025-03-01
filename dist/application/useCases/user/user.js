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
exports.userUseCase = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const tempUser_1 = require("../../../infrastructure/models/tempUser");
class userUseCase {
    constructor(repository) {
        this.repository = repository;
        this.userExist = (email) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.userExist(email);
            }
            catch (error) {
                throw error;
            }
        });
        this.verifyOtp = (email, otp) => __awaiter(this, void 0, void 0, function* () {
            try {
                const otpUser = yield tempUser_1.tempUserModel.findOne({ email, otp });
                if (otpUser) {
                    return true;
                }
                return false;
            }
            catch (error) {
                throw error;
            }
        });
        this.bcrypt = (password) => __awaiter(this, void 0, void 0, function* () {
            try {
                const saltRounds = 10;
                const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
                return hashedPassword;
            }
            catch (error) {
                throw error;
            }
        });
        this.jwt = (payload) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = jsonwebtoken_1.default.sign({
                    id: payload._id,
                    username: payload.username,
                    email: payload.email,
                    role: "user",
                }, "loginsecrit", { expiresIn: "2h" });
                if (token) {
                    return token;
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.loginUser = (email, password) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.loginUser(email, password);
            }
            catch (error) {
                throw error;
            }
        });
        this.tempUserExist = (email) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.tempUserExist(email);
            }
            catch (error) {
                throw error;
            }
        });
        this.checkOtp = (user) => __awaiter(this, void 0, void 0, function* () {
            try {
                const insertUser = yield this.repository.checkOtp(user);
                return insertUser;
            }
            catch (error) {
                throw error;
            }
        });
        this.otpUser = (email, otp, username, password) => __awaiter(this, void 0, void 0, function* () {
            try {
                const insertedOtpUser = yield this._repository.OtpUser(email, otp, username, password);
                if (insertedOtpUser) {
                    yield this.sendmail(email, otp);
                }
                return insertedOtpUser;
            }
            catch (error) {
                throw error;
            }
        });
        this.sendmail = (email, otp) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("otp send mailer is", otp);
                const sendOtpEmail = (email, otp) => __awaiter(this, void 0, void 0, function* () {
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
                            subject: "One-Time Password (OTP) for Authentication",
                            html: `
            <div style="font-family: Arial, sans-serif;">
              <p>Dear User,</p>
              <p>Your One-Time Password (OTP) for authentication is: <h1>${otp}</h1></p>
              <p>Please click the button below to verify your account:</p>
             
              
            </div>
          `,
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                resolve(info.response);
                                console.log("mailsend");
                            }
                        });
                    });
                });
                const mailSent = yield sendOtpEmail(email, otp);
                return mailSent;
            }
            catch (error) {
                console.error("Error in sending mail:", error);
                throw error;
            }
        });
        this.resendOtp = (email, otp) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(email, otp, "otp sent");
                const otpUser = yield this._repository.resendOtp(email, otp);
                if (otpUser) {
                    this.sendmail(email, otp);
                    console.log("otp user", otpUser);
                }
                return otpUser ? otpUser : null;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
        this.walletHistory = (objectId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const walletHistory = this._repository.walletHistory(objectId);
                return walletHistory;
            }
            catch (error) {
                throw error;
            }
        });
        this.changePassword = (id, oldPassword, newPassword) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this._repository.getUserDetails(id);
                if (!user) {
                    throw new Error("User not found");
                }
                const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
                if (!isMatch) {
                    throw new Error("Old password is incorrect");
                }
                const hashedNewPassword = yield this.bcrypt(newPassword);
                user.password = hashedNewPassword;
                const updatedUser = yield this._repository.updateUserPassword(id, newPassword);
                return updatedUser;
            }
            catch (error) {
                console.error("Error changing password :", error);
                throw error;
            }
        });
        this.getUserDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._repository.getUserDetails(id);
                return response ? response : null;
            }
            catch (error) {
                console.error("error occured", error);
                return null;
            }
        });
        this._repository = repository;
    }
}
exports.userUseCase = userUseCase;
