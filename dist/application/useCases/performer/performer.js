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
exports.performerUseCase = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const S3Video_1 = require("../../../infrastructure/s3/S3Video");
class performerUseCase {
    constructor(repository) {
        this.repository = repository;
        this.getPerformerDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._repository.getPerformerDetails(id);
                return response ? response : null;
            }
            catch (error) {
                console.log(error);
                console.error("error occurred");
                return null;
            }
        });
        this.getReport = (performerId, startDate, endDate) => __awaiter(this, void 0, void 0, function* () {
            try {
                const report = yield this._repository.getReport(performerId, startDate, endDate);
                return report;
            }
            catch (error) {
                console.error("Error fetching performer report:", error);
                return null;
            }
        });
        this.getAllUsers = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getAllUsers(id);
            }
            catch (error) {
                throw error;
            }
        });
        this.performerAllDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allDetails = yield this._repository.performerAllDetails(id);
                return allDetails;
            }
            catch (error) {
                throw error;
            }
        });
        this.loginPerformer = (email, password) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.loginPerformer(email, password);
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
                    role: "performer",
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
        // getPerformerDetails = async (id: any) => {
        //   try {
        //     const response = await this._repository.getPerformerDetails(id);
        //     return response ? response : null;
        //   } catch (error) {
        //     console.log(error)
        //     console.error("error occurred");
        //     return null;
        //   }
        // };
        this.videoUpload = (bandName, mobileNumber, description, user_id, video) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const s3Response = yield (0, S3Video_1.uploadS3Video)(video);
                if (s3Response.error) {
                    console.error("Error uploading video to S3:", s3Response.error);
                    throw new Error("Failed to upload video to S3");
                }
                const s3Location = (_a = s3Response.Location) !== null && _a !== void 0 ? _a : "";
                const response = yield this._repository.videoUploadDB(bandName, mobileNumber, description, user_id, s3Location);
                return response ? response : null;
            }
            catch (error) {
                console.error("Error occurred during video upload:", error);
                return null;
            }
        });
        this.slotDetails = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const slotDetails = yield this._repository.slotDetails(id);
                return slotDetails;
            }
            catch (error) {
                throw error;
            }
        });
        this.updateslot = (id, date) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.updateslot(id, date);
            }
            catch (error) {
                throw error;
            }
        });
        this._repository = repository;
    }
}
exports.performerUseCase = performerUseCase;
