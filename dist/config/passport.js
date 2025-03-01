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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = require("../infrastructure/models/userModel");
dotenv_1.default.config();
const passportConfig = () => {
    passport_1.default.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield userModel_1.UserModel.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        callbackURL: "/auth/google/callback",
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("passport configuration is working");
            let user = yield userModel_1.UserModel.findOne({ email: profile._json.email });
            if (user) {
                console.log("user already exists!");
                return done(null, user);
            }
            else {
                // Create a new user
                const newUser = new userModel_1.UserModel({
                    username: profile._json.given_name || "", // Ensure you handle cases where profile._json.given_name may be undefined
                    email: profile._json.email,
                    password: 'password', // Set the hashed password here
                    isblocked: false,
                    isVerified: false,
                    profileImage: profile._json.picture || null,
                });
                console.log("new user", newUser);
                // Save the new user to the database
                yield newUser.save();
                done(null, newUser);
            }
        }
        catch (error) {
            done(error);
        }
    })));
};
exports.default = passportConfig;
