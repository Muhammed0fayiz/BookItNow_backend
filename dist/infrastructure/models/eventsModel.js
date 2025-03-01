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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true, default: "active" },
    teamLeader: { type: String, required: true },
    teamLeaderNumber: { type: String, required: true },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isblocked: { type: Boolean, default: false },
    isperformerblockedevents: { type: Boolean, default: false },
    blockingReason: { type: String, default: "" },
    blockingPeriod: { type: Date, default: null },
}, { timestamps: true });
exports.EventModel = mongoose_1.default.model("Event", EventSchema);
