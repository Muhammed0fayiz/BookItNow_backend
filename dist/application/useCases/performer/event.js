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
exports.performerEventUseCase = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class performerEventUseCase {
    constructor(repository) {
        this.repository = repository;
        this.uploadedEvents = (event) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.uploadedEvents(event);
            }
            catch (error) {
                console.error("Error inserting event:", error);
                throw error;
            }
        });
        this.appealSend = (eventId, email, appealMessage) => __awaiter(this, void 0, void 0, function* () {
            try {
                const event = yield this._repository.getEvent(eventId);
                if (!event) {
                    throw new Error('Event not found');
                }
                const transporter = nodemailer_1.default.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_ADDRESS,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                const mailOptions = {
                    from: email,
                    to: 'fayiz149165@gmail.com',
                    subject: `Appeal for Event: ${event.title}`,
                    text: `Hi Admin,\n\nI am the founder of the event titled "${event.title}".\n\n"${appealMessage}"\n\nPlease consider this appeal and let me know if there is anything I can do.\n\nThank you.`,
                };
                const info = yield transporter.sendMail(mailOptions);
                console.log('Email sent: ', info.response);
                return event;
            }
            catch (error) {
                console.error('Error sending appeal:', error);
                throw error;
            }
        });
        this.editEvents = (eventId, event) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('use case`');
                const updatedEvent = yield this._repository.editEvents(eventId, event);
                return updatedEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.toggleBlockStatus = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.toggleBlockStatus(id);
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllUpcomingEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this._repository.getAllUpcomingEvents(id);
                return {
                    totalCount: result.totalCount,
                    upcomingEvents: result.upcomingEvents,
                };
            }
            catch (error) {
                throw error;
            }
        });
        this.cancelEvent = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.cancelEvent(id);
            }
            catch (error) {
                throw error;
            }
        });
        this.getAlleventHistory = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this._repository.getAlleventHistory(id);
                return {
                    totalCount: result.totalCount,
                    eventHistory: result.eventHistory,
                };
            }
            catch (error) {
                throw error;
            }
        });
        // getAlleventHistory=asy(id: unknown): Promise<UpcomingEventDocument[] | null> | Promise<{ totalCount: number; eventHistory: UpcomingEventDocument[]; }> {
        //   throw new Error("Method not implemented.");
        // }
        // getAlleventHistory = async (
        //   id: mongoose.Types.ObjectId
        // ): Promise<UpcomingEventDocument[] | null> => {
        //   try {
        //     const eventHistory = await this._repository.getAlleventHistory(id);
        //     return eventHistory;
        //   } catch (error) {
        //     throw error;
        //   }
        // };
        this.changeEventStatus = () => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.changeEventStatus();
            }
            catch (error) {
                throw error;
            }
        });
        this.getUpcomingEvents = (performerId, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._repository.getUpcomingEvents(performerId, page);
                return response;
            }
            catch (error) {
                console.error("Error in getUpcomingEvents usecase:", error);
                throw error;
            }
        });
        this.getPerformerEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performerEvents = yield this._repository.getPerformerEvents(id);
                return performerEvents;
            }
            catch (error) {
                throw error;
            }
        });
        this.getEvent = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.getEvent(eventId);
            }
            catch (error) {
                throw error;
            }
        });
        this._repository = repository;
    }
    deleteEvent(id) {
        try {
            return this._repository.deleteEvent(id);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.performerEventUseCase = performerEventUseCase;
