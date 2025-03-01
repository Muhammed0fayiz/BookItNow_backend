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
exports.UpcomingEvent = exports.UpcomingEventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Schema for Upcoming Events
const UpcomingEventSchema = new mongoose_1.Schema({
    // Event Related Fields
    title: { type: String, required: true },
    category: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    performerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Performer', required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true, default: 'active' },
    teamLeader: { type: String, required: true },
    teamLeaderNumber: { type: String, required: true },
    rating: { type: Number, default: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isblocked: { type: Boolean, default: false },
    username: { type: String, required: true },
    // Booking Related Fields
    advancePayment: { type: Number, required: true },
    restPayment: { type: Number, required: true },
    time: { type: String, required: true },
    place: { type: String, required: true },
    date: { type: Date, required: true },
    bookingStatus: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] },
}, { timestamps: true });
// Create indexes for better query performance
UpcomingEventSchema.index({ date: 1 });
UpcomingEventSchema.index({ performerId: 1 });
UpcomingEventSchema.index({ userId: 1 });
// Create the model
exports.UpcomingEventModel = mongoose_1.default.model('UpcomingEvent', UpcomingEventSchema);
// Class representation (optional, for better type safety)
class UpcomingEvent {
    constructor(title, category, userId, performerId, price, status, teamLeader, teamLeaderNumber, rating, description, imageUrl, advancePayment, restPayment, time, place, date, bookingStatus, isblocked = false, _id) {
        this.title = title;
        this.category = category;
        this.userId = userId;
        this.performerId = performerId;
        this.price = price;
        this.status = status;
        this.teamLeader = teamLeader;
        this.teamLeaderNumber = teamLeaderNumber;
        this.rating = rating;
        this.description = description;
        this.imageUrl = imageUrl;
        this.advancePayment = advancePayment;
        this.restPayment = restPayment;
        this.time = time;
        this.place = place;
        this.date = date;
        this.bookingStatus = bookingStatus;
        this.isblocked = isblocked;
        this._id = _id;
    }
}
exports.UpcomingEvent = UpcomingEvent;
