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
exports.performerEventController = void 0;
const responseStatus_1 = require("../../../constants/responseStatus");
const mongoose_1 = __importStar(require("mongoose"));
const constant_1 = require("../../../shared/utils/constant");
class performerEventController {
    constructor(useCase) {
        this.useCase = useCase;
        this.uploadEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Function uploadEvents called");
                const userId = req.params.id;
                console.log("Extracted userId:", userId);
                if (!req.body) {
                    console.log("Request body is missing");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.ErrorMessages.NO_EVENT_FOUND });
                }
                console.log("Processing event data from request body");
                const event = {
                    imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : undefined,
                    title: req.body.title ? req.body.title.trim() : "",
                    category: req.body.category ? req.body.category.trim() : "",
                    userId: new mongoose_1.Types.ObjectId(userId),
                    price: req.body.price ? parseFloat(req.body.price) : 0,
                    teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : "",
                    teamLeaderNumber: req.body.teamLeaderNumber
                        ? parseInt(req.body.teamLeaderNumber, 10)
                        : 0,
                    description: req.body.description ? req.body.description.trim() : "",
                };
                console.log("Event object constructed:", event);
                if (!event.imageUrl ||
                    !event.title ||
                    !event.category ||
                    !event.userId ||
                    !event.price ||
                    !event.teamLeader ||
                    !event.teamLeaderNumber ||
                    !event.description) {
                    console.log("Validation failed: Missing required fields");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.ErrorMessages.ALL_FIELD_REQUIRED });
                }
                if (event.title.length < 2) {
                    console.log("Validation failed: Title is too short");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.EventMessages.EVENT_TITLE_ERROR });
                }
                if (isNaN(event.price)) {
                    console.log("Validation failed: Price is not a number");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.EventMessages.EVENT_PRICE_ERROR });
                }
                if (!/^\d{10}$/.test(event.teamLeaderNumber.toString())) {
                    console.log("Validation failed: Invalid phone number format");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.EventMessages.PHONE_NUMBER_ERROR });
                }
                if (event.description.length < 10) {
                    console.log("Validation failed: Description is too short");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.EventMessages.DESCRIPTION_ERROR });
                }
                console.log("All validations passed, proceeding to upload event");
                const uploadedEvent = yield this._useCase.uploadedEvents(event);
                console.log("Upload result:", uploadedEvent);
                if (uploadedEvent === "Event already exists") {
                    console.log("Conflict: Event already exists");
                    return res
                        .status(responseStatus_1.ResponseStatus.Conflict)
                        .json({ message: constant_1.EventMessages.EXISTING_EVENT_ERROR });
                }
                if (uploadedEvent) {
                    console.log("Event uploaded successfully:", uploadedEvent);
                    return res
                        .status(responseStatus_1.ResponseStatus.Created)
                        .json({ message: constant_1.EventMessages.SUCCESS, event: uploadedEvent });
                }
                else {
                    console.log("Event upload failed");
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.EventMessages.FAILED_UPLOAD_EVENT });
                }
            }
            catch (error) {
                console.log("Error occurred:", error);
                next(error);
            }
        });
        this.getPerformerEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const events = yield this._useCase.getPerformerEvents(id);
                res.status(responseStatus_1.ResponseStatus.OK).json(events);
                return events;
            }
            catch (error) {
                next(error);
                return null;
            }
        });
        this.deleteEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.MessageConstants.EVENT_ID_REQUIRED });
                    return;
                }
                const deletedEvent = yield this._useCase.deleteEvent(id);
                if (deletedEvent) {
                    res.status(responseStatus_1.ResponseStatus.OK).json({ message: constant_1.EventMessages.SUCCESS });
                    return;
                }
                else {
                    res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: constant_1.ErrorMessages.NO_EVENT_FOUND });
                    return;
                }
            }
            catch (error) {
                console.error("Error deleting event:", error);
                next(error);
            }
        });
        this.editEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const eventId = req.params.eid;
                if (!req.body) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.EventMessages.NO_EVENTS_FOUND });
                }
                const event = {
                    imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : undefined,
                    title: req.body.title ? req.body.title.trim() : "",
                    category: req.body.category ? req.body.category.trim() : "",
                    userId: new mongoose_1.Types.ObjectId(userId),
                    price: req.body.price ? parseFloat(req.body.price) : 0,
                    teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : "",
                    teamLeaderNumber: req.body.teamLeaderNumber
                        ? parseInt(req.body.teamLeaderNumber, 10)
                        : 0,
                    description: req.body.description ? req.body.description.trim() : "",
                };
                if (!event.title ||
                    !event.category ||
                    !event.price ||
                    !event.teamLeader ||
                    !event.teamLeaderNumber ||
                    !event.description) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.ErrorMessages.ALL_FIELD_REQUIRED });
                }
                const updatedEvent = yield this._useCase.editEvents(eventId, event);
                if (updatedEvent === "Event already exists" || updatedEvent === constant_1.ErrorMessages.NO_EVENT_FOUND) {
                    const status = updatedEvent === "Event already exists" ? responseStatus_1.ResponseStatus.Conflict : responseStatus_1.ResponseStatus.NotFound;
                    const message = updatedEvent === "Event already exists"
                        ? "An event with the same category, title, and price already exists."
                        : "Event not found.";
                    return res.status(status).json({ message });
                }
                if (updatedEvent) {
                    return res
                        .status(responseStatus_1.ResponseStatus.OK)
                        .json({ message: "Event updated successfully", event: updatedEvent });
                }
                else {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: "Event not found." });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this.toggleBlockStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id || typeof id !== "string") {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.ErrorMessages.INVALID_OR_MISSING_ID });
                }
                const changedEvent = yield this._useCase.toggleBlockStatus(id);
                if (!changedEvent) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NotFound)
                        .json({ message: constant_1.EventMessages.EVENT_NOT_FOUND_OR_FAILED_UPDATE });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    message: "Block status toggled successfully",
                    data: changedEvent,
                });
            }
            catch (error) {
                console.error("Error toggling block status:", error);
                next(error);
            }
        });
        this.upcomingEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = req.params.id;
                const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
                const upcomingEvents = yield this._useCase.getAllUpcomingEvents(userObjectId);
                if (((_a = upcomingEvents === null || upcomingEvents === void 0 ? void 0 : upcomingEvents.upcomingEvents) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        totalCount: upcomingEvents.totalCount,
                        events: upcomingEvents.upcomingEvents,
                    });
                }
                return res
                    .status(responseStatus_1.ResponseStatus.NotFound)
                    .json({ success: false, message: constant_1.EventMessages.NO_EVENTS_FOUND });
            }
            catch (error) {
                next(error);
            }
        });
        this.cancelEventByPerformer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const eventObjectId = new mongoose_1.default.Types.ObjectId(id);
                if (!eventObjectId) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({
                        success: false,
                        message: constant_1.EventMessages.EVENT_ID_REQUIRED,
                    });
                }
                const canceledEvent = yield this._useCase.cancelEvent(eventObjectId);
                if (canceledEvent) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        message: constant_1.EventMessages.SUCCESS,
                        data: canceledEvent,
                    });
                }
                else {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({
                        success: false,
                        message: constant_1.EventMessages.NO_EVENTS_FOUND,
                    });
                }
            }
            catch (error) {
                return next(error);
            }
        });
        this.eventHistory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userObjectId = new mongoose_1.default.Types.ObjectId(id);
                const result = yield this._useCase.getAlleventHistory(userObjectId);
                if (((_a = result.eventHistory) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    return res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        totalCount: result.totalCount,
                        events: result.eventHistory,
                    });
                }
                return res
                    .status(responseStatus_1.ResponseStatus.NotFound)
                    .json({ success: false, message: constant_1.EventMessages.NO_EVENTS_FOUND });
            }
            catch (error) {
                next(error);
            }
        });
        this.changeEventStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedEvent = yield this._useCase.changeEventStatus();
                if (updatedEvent) {
                    return res.status(200).json({ success: true, data: updatedEvent });
                }
                else {
                    return res.status(404).json({ success: false, message: "No event status updated" });
                }
            }
            catch (error) {
                console.error("Error changing event status:", error);
                next(error);
            }
        });
        this.getUpcomingEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const performerId = new mongoose_1.default.Types.ObjectId(id);
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const upcomingEvents = yield this._useCase.getUpcomingEvents(performerId, page);
                return res.json({ events: upcomingEvents || [] });
            }
            catch (error) {
                next(error);
            }
        });
        this.appealBlockedEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, email } = req.params;
                const { appealMessage } = req.body;
                const eventId = new mongoose_1.default.Types.ObjectId(id);
                const appeal = yield this._useCase.appealSend(eventId, email, appealMessage);
                res.status(responseStatus_1.ResponseStatus.OK).json({ message: constant_1.EventMessages.SUCCESS, appeal });
            }
            catch (error) {
                next(error);
            }
        });
        this.getEvent = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const eventid = new mongoose_1.default.Types.ObjectId(id);
                const event = yield this._useCase.getEvent(eventid);
                if (event) {
                    res.status(responseStatus_1.ResponseStatus.OK).json({
                        success: true,
                        data: event,
                    });
                }
                else {
                    res.status(responseStatus_1.ResponseStatus.NotFound).json({
                        success: false,
                        message: constant_1.EventMessages.NO_EVENTS_FOUND,
                    });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this._useCase = useCase;
    }
}
exports.performerEventController = performerEventController;
