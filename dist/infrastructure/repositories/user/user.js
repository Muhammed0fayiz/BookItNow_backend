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
exports.userRepository = void 0;
const user_1 = require("../../../domain/entities/user");
const otpUser_1 = require("../../../domain/entities/otpUser");
const userModel_1 = require("../../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tempPerformer_1 = require("../../models/tempPerformer");
const tempUser_1 = require("../../models/tempUser");
const performerModel_1 = require("../../models/performerModel");
const walletHistory_1 = require("../../models/walletHistory");
class userRepository {
    constructor() {
        this.getUserDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.UserModel.findById(id).lean().exec();
                if (!user)
                    throw new Error("User not found");
                return user ? user : null;
            }
            catch (error) {
                console.error("error occured", error);
                return null;
            }
        });
        this.updateUserPassword = (id, newPassword) => __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                const updatedUser = yield userModel_1.UserModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
                return updatedUser;
            }
            catch (error) {
                console.error("Error updating user password:", error);
                throw error;
            }
        });
        this.walletHistory = (objectId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userWallet = yield walletHistory_1.WalletModel.find({ userId: objectId }).sort({
                    _id: -1,
                });
                return userWallet;
            }
            catch (error) {
                throw error;
            }
        });
        this.resendOtp = (email, otp) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield tempUser_1.tempUserModel.findOne({ email });
                // Making the email case-insensitive
                const m = yield tempUser_1.tempUserModel.findOne({
                    email: { $regex: new RegExp(`^${email}$`, "i") },
                });
                if (!m) {
                    throw new Error("User not found");
                }
                // Update OTP
                const result = yield tempUser_1.tempUserModel.findOneAndUpdate({ email: m.email }, { otp: otp }, // Use the provided otp
                { new: true });
                return result;
            }
            catch (error) {
                throw error;
            }
        });
        this.getTempPerformer = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const tmp = yield tempPerformer_1.TempPerformerModel.find();
                if (tmp) {
                    return tmp;
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.loginUser = (email, password) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield userModel_1.UserModel.findOne({ email: email });
                if (!user) {
                    return null;
                }
                else if (user.isblocked) {
                    return "User Is Blocked";
                }
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    return null;
                }
                return {
                    username: user.username,
                    email: user.email,
                    password: user.password,
                    _id: (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    isVerified: user.isVerified,
                    isblocked: user.isblocked,
                };
            }
            catch (error) {
                throw error;
            }
        });
        this.tempUserExist = (email) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tempUser = yield tempUser_1.tempUserModel.findOne({ email: email });
                if (!tempUser) {
                    return null;
                }
                return new otpUser_1.OtpUser(tempUser.username, tempUser.email, tempUser.password, (_a = tempUser._id) === null || _a === void 0 ? void 0 : _a.toString(), tempUser.otp);
            }
            catch (error) {
                console.error("Error finding temp user:", error);
                throw error;
            }
        });
        this.checkOtp = (user) => __awaiter(this, void 0, void 0, function* () {
            try {
                const otpUser = yield tempUser_1.tempUserModel.findOne({
                    email: user.email,
                    otp: user.otp,
                });
                if (otpUser !== null) {
                    const insertedUser = yield this.insertUser(otpUser.email, otpUser.password, otpUser.username);
                    if (insertedUser) {
                        yield tempUser_1.tempUserModel.deleteOne({ email: user.email, otp: user.otp });
                    }
                    return insertedUser;
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.insertUser = (email, password, username) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = {
                    email: email,
                    password: password,
                    username: username,
                    isVerified: false,
                    isblocked: false,
                };
                const userData = yield userModel_1.UserModel.insertMany([user]);
                if (userData && userData.length > 0) {
                    const insertedUser = userData[0].toObject();
                    return new user_1.User(insertedUser.username, insertedUser.email, insertedUser.password, insertedUser.isVerified, insertedUser.isblocked);
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.OtpUser = (mail, otp, password, username) => __awaiter(this, void 0, void 0, function* () {
            try {
                const otpUser = {
                    email: mail,
                    otp: otp,
                    username: username,
                    password: password,
                };
                const tempUserData = yield tempUser_1.tempUserModel.insertMany([otpUser]);
                if (tempUserData && tempUserData.length > 0) {
                    return new otpUser_1.OtpUser(otpUser.email, otpUser.otp, otpUser.password, otpUser.username);
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.userExist = (email) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield userModel_1.UserModel.findOne({ email: email });
                if (!user) {
                    return null;
                }
                return new user_1.User(user.username, user.email, user.password, user.isVerified, user.isblocked, (_a = user._id) === null || _a === void 0 ? void 0 : _a.toString());
            }
            catch (error) {
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
exports.userRepository = userRepository;
