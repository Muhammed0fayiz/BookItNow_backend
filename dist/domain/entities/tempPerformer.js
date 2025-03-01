"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempPerformerModel = exports.TempPerformer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Domain Entity
class TempPerformer {
    constructor(bandName, mobileNumber, video, description, user_id, _id) {
        this.bandName = bandName;
        this.mobileNumber = mobileNumber;
        this.video = video;
        this.description = description;
        this.user_id = user_id;
        this._id = _id;
    }
}
exports.TempPerformer = TempPerformer;
// Schema for infrastructure layer
const mongoose_2 = require("mongoose");
const TempPerformerSchema = new mongoose_2.Schema({
    bandName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    video: { type: String, required: true },
    description: { type: String, required: true },
    user_id: { type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});
exports.TempPerformerModel = mongoose_1.default.model('TempPerformer', TempPerformerSchema);
