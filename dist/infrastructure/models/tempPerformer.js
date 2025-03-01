"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.videoUploadDB = exports.TempPerformerModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema definition
const TempPerformerSchema = new mongoose_1.Schema({
    bandName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    video: { type: String, required: true },
    description: { type: String, required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
exports.TempPerformerModel = mongoose_1.default.model('TempPerformer', TempPerformerSchema);
// Database operation
const videoUploadDB = (bandName, mobileNumber, description, user_id, s3Location) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newTempPerformer = new exports.TempPerformerModel({
            bandName,
            mobileNumber,
            video: s3Location,
            description,
            user_id
        });
        return yield newTempPerformer.save();
    }
    catch (error) {
        console.error("Error occurred while creating temp performer:", error);
        return null;
    }
});
exports.videoUploadDB = videoUploadDB;
