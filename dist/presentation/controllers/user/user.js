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
exports.UserController = void 0;
const validEmail_1 = require("../../../shared/utils/validEmail");
const responseStatus_1 = require("../../../constants/responseStatus");
const validPassword_1 = require("../../../shared/utils/validPassword");
const validName_1 = require("../../../shared/utils/validName");
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../../../infrastructure/models/userModel");
const generateOtp_1 = require("../../../shared/utils/generateOtp");
const constant_1 = require("../../../shared/utils/constant");
class UserController {
    constructor(useCase) {
        this.useCase = useCase;
        this.userLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.NO_USER_DATA });
                }
                const user = {
                    email: req.body.email ? req.body.email.trim() : null,
                    password: req.body.password ? req.body.password.trim() : null,
                };
                if (!user.password || !user.email) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.PASSWORD_EMAIL_REQUIRED });
                }
                if (!(0, validEmail_1.isValidEmail)(user.email)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.INVALID_EMAIL });
                }
                const loginUser = yield this._useCase.loginUser(user.email, user.password);
                if (loginUser) {
                    if (typeof loginUser === "string") {
                        return res
                            .status(responseStatus_1.ResponseStatus.Forbidden)
                            .json({ message: loginUser });
                    }
                    const token = yield this._useCase.jwt(loginUser);
                    res.status(responseStatus_1.ResponseStatus.Accepted).json({ token: token });
                }
                else {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.USER_NOT_FOUND });
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
        this.userSignup = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.NO_USER_DATA });
                }
                const user = {
                    email: req.body.email ? req.body.email.trim() : null,
                    password: req.body.password ? req.body.password.trim() : null,
                    username: req.body.fullName,
                };
                if (!user.password || !user.email || !user.username) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: "fullname,email and password is required" });
                }
                if (!(0, validEmail_1.isValidEmail)(user.email)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.INVALID_EMAIL });
                }
                if (!(0, validPassword_1.isValidPassword)(user.password)) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({
                        message: constant_1.UserMessages.INVALID_PASSWORD,
                    });
                }
                const tempMailExist = yield this.useCase.tempUserExist(user.email);
                if (tempMailExist) {
                    return res
                        .status(responseStatus_1.ResponseStatus.Unauthorized)
                        .json({ message: constant_1.OTPMessages.OTP_ALREADY_SENT });
                }
                const mailExist = yield this._useCase.userExist(user.email);
                if (mailExist) {
                    return res.status(responseStatus_1.ResponseStatus.Unauthorized).json({ message: constant_1.UserMessages.EMAIL_EXISTS });
                }
                if (!(0, validName_1.isValidFullName)(user.username)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.INVALID_FULLNAME });
                }
                const hashedPassword = yield this._useCase.bcrypt(user.password);
                user.password = hashedPassword;
                const otp = (0, generateOtp_1.generateOTP)();
                const tempUser = yield this._useCase.otpUser(user.email, otp, user.password, user.username);
                if (tempUser) {
                    console.log("otp", otp);
                    return res
                        .status(responseStatus_1.ResponseStatus.Created)
                        .json({ message: constant_1.OTPMessages.OTP_GENERATED, tempUser });
                }
                return res
                    .status(responseStatus_1.ResponseStatus.BadRequest)
                    .json({ message: constant_1.UserMessages.USER_NOT_CREATED });
            }
            catch (error) {
                next(error);
            }
        });
        this.checkOtp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = {
                    email: req.body.email,
                    otp: req.body.otp,
                };
                const otpCheck = yield this._useCase.checkOtp(user);
                if (otpCheck === null) {
                    console.log("Null result: OTP check failed.");
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.OTPMessages.INVALID_OTP });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({ message: constant_1.OTPMessages.OTP_VERIFIED });
            }
            catch (error) {
                console.error(error);
                res.status(responseStatus_1.ResponseStatus.InternalSeverError).json({ message: constant_1.MessageConstants.INTERANAL_SERVER_ERROR });
                next(error);
            }
        });
        this.resendOtp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('hell');
                const email = req.params.email;
                if (email) {
                    const otp = (0, generateOtp_1.generateOTP)();
                    yield this._useCase.resendOtp(email, otp);
                    res.status(responseStatus_1.ResponseStatus.OK).json({ message: "resend otp successfull" });
                }
            }
            catch (error) {
                res.status(responseStatus_1.ResponseStatus.InternalSeverError).json({ message: "internal server error" });
                next(error);
            }
        });
        this.getUserDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.INVALID_USER_ID });
                }
                const objectId = new mongoose_1.default.Types.ObjectId(id);
                const response = yield this._useCase.getUserDetails(objectId);
                if (response) {
                    return res
                        .status(responseStatus_1.ResponseStatus.Accepted)
                        .json({ message: constant_1.UserMessages.USER_DETAILS_SUCCESS, response });
                }
                else {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.USER_DETAILS_FAILED });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this.updateUserProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { username } = req.body;
                const userId = new mongoose_1.default.Types.ObjectId(req.params.id);
                const image = req.file ? `/uploads/${req.file.filename}` : null;
                const updateData = {
                    username,
                };
                if (image) {
                    updateData.profileImage = image;
                }
                const updatedUser = (yield userModel_1.UserModel.findByIdAndUpdate(userId, updateData, { new: true }));
                if (updatedUser) {
                    res
                        .status(responseStatus_1.ResponseStatus.OK)
                        .json({ message: constant_1.UserMessages.PROFILE_UPDATE_SUCCESS, updatedUser });
                }
                else {
                    res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: constant_1.UserMessages.USER_NOT_FOUND });
                }
            }
            catch (error) {
                console.error("Error updating user profile:", error);
                next(error);
                if (error instanceof Error) {
                    res
                        .status(responseStatus_1.ResponseStatus.InternalSeverError)
                        .json({ message: constant_1.UserMessages.ERROR_UPDATING_PROFILE, error: error.message });
                }
                else {
                    res.status(responseStatus_1.ResponseStatus.InternalSeverError).json({ message: constant_1.UserMessages.UNKNOWN_ERROR });
                }
            }
        });
        this.changePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = new mongoose_1.default.Types.ObjectId(req.params.id);
                const { currentPassword, newPassword } = req.body;
                if (!id || !currentPassword || !newPassword) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.UserMessages.MISSING_FIELDS });
                }
                const changedPassword = yield this._useCase.changePassword(id, currentPassword, newPassword);
                return res.status(responseStatus_1.ResponseStatus.OK).json({ success: true, user: changedPassword });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === constant_1.UserMessages.PASSWORD_CHANGE_FAILED) {
                        return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: error.message });
                    }
                    return res
                        .status(responseStatus_1.ResponseStatus.InternalSeverError)
                        .json({ message: constant_1.MessageConstants.ERROR_OCCURRED, error: error.message });
                }
                return res.status(responseStatus_1.ResponseStatus.InternalSeverError).json({ message: constant_1.UserMessages.UNKNOWN_ERROR });
                next(error);
            }
        });
        this.walletHistory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const objectId = new mongoose_1.default.Types.ObjectId(id);
                const walletHistory = yield this._useCase.walletHistory(objectId);
                res.status(responseStatus_1.ResponseStatus.OK).json({ success: true, data: walletHistory });
            }
            catch (error) {
                next(error);
            }
        });
        this._useCase = useCase;
    }
    // Google Callback function
    googleCallback(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.user) {
                    const user = req.user;
                    const token = yield this._useCase.jwt(user);
                    // Don't encode the token since it's already a JWT string
                    res.cookie("userToken", token, {
                        httpOnly: false,
                        secure: true,
                        sameSite: "none",
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                    res.redirect(`http://localhost:3000`);
                }
                else {
                    res.redirect("http://localhost:3000");
                }
            }
            catch (error) {
                console.error("Error during Google callback:", error);
                res.redirect("http://localhost:3000/error");
                next(error);
            }
        });
    }
}
exports.UserController = UserController;
