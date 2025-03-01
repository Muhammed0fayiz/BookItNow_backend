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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEventUseCase = void 0;
class userEventUseCase {
    constructor(repository) {
        this.repository = repository;
        this.getEvent = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.getEvent(eventId);
            }
            catch (error) {
                throw error;
            }
        });
        this.getPerformerEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getPerformerEvents(id);
            }
            catch (error) {
                throw error;
            }
        });
        this.getPerformer = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield this._repository.getPerformer(id);
        });
        this.getTopRatedEvent = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ratedEvent = yield this._repository.getTopRatedEvent(userId);
                return ratedEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.getAllEvents(id);
            }
            catch (error) {
                throw error;
            }
        });
        this.toggleFavoriteEvent = (uid, eid) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.toggleFavoriteEvent(uid, eid);
            }
            catch (error) {
                throw error;
            }
        });
        this.ratingAdded = (bookingId, rating, review) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.ratingAdded(bookingId, rating, review);
            }
            catch (error) {
                throw error;
            }
        });
        this.getEventRating = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.getEventRating(eventId);
            }
            catch (error) {
                throw error;
            }
        });
        this.userBookEvent = (formData, eventId, performerId, userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bookEvent = this._repository.userBookEvent(formData, eventId, performerId, userId);
                return bookEvent;
            }
            catch (error) {
                throw error;
            }
        });
        this.userWalletBookEvent = (formData, eventId, performerId, userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const walletbooking = this._repository.userWalletBookEvent(formData, eventId, performerId, userId);
                return walletbooking;
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
        this.getAllEventHistory = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this._repository.getAllEventHistory(id);
                return {
                    totalCount: result.totalCount,
                    pastEventHistory: result.pastEventHistory,
                };
            }
            catch (error) {
                throw error;
            }
        });
        this.getEventHistory = (userId, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Make sure you're calling the correct method, not the one that leads to recursion.
                const response = yield this._repository.getEventHistory(userId, page); // <-- Call the correct method
                return response; // Return the response correctly
            }
            catch (error) {
                console.error("Error in getEventHistory usecase:", error);
                throw error; // Propagate the error to be handled by the caller
            }
        });
        this.getFilteredEvents = (id, filterOptions, sortOptions, skip, limit) => __awaiter(this, void 0, void 0, function* () {
            try {
                const filteredEvents = yield this._repository.getFilteredEvents(id, filterOptions, sortOptions, skip, limit);
                return filteredEvents;
            }
            catch (error) {
                throw error;
            }
        });
        this.favaroiteEvents = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.favaroiteEvents(id);
            }
            catch (error) {
                throw error;
            }
        });
        this.getUpcomingEvents = (userId, page) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._repository.getUpcomingEvents(userId, page);
                return response;
            }
            catch (error) {
                console.error("Error in getUpcomingEvents usecase:", error);
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
        this.getFilteredPerformers = (id, filterOptions, sortOptions, skip, limit) => __awaiter(this, void 0, void 0, function* () {
            try {
                const filteredPerformers = yield this._repository.getFilteredPerformers(id, filterOptions, sortOptions, skip, limit);
                return filteredPerformers;
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllPerformer = (id) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.getAllPerformer(id);
            }
            catch (error) {
                throw error;
            }
        });
        this._repository = repository;
    }
    availableDate(formData, eventId, performerId) {
        try {
            const bookEvent = this._repository.availableDate(formData, eventId, performerId);
            return bookEvent;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.userEventUseCase = userEventUseCase;
