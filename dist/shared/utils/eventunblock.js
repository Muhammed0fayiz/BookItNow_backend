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
exports.unblockExpiredEvents = void 0;
const eventsModel_1 = require("./../../infrastructure/models/eventsModel");
const unblockExpiredEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('unblock');
        const eventsToUnblock = yield eventsModel_1.EventModel.find({
            isblocked: true,
            blockingPeriod: { $lt: new Date() }
        });
        // Unblock events
        const unblockedEvents = yield Promise.all(eventsToUnblock.map((event) => __awaiter(void 0, void 0, void 0, function* () {
            event.isblocked = false;
            event.blockingReason = '';
            event.blockingPeriod = null;
            return yield event.save();
        })));
    }
    catch (error) {
        console.error("Error unblocking expired events:", error);
        throw error;
    }
});
exports.unblockExpiredEvents = unblockExpiredEvents;
