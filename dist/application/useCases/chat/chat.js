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
exports.chatUseCase = void 0;
class chatUseCase {
    constructor(repository) {
        this.repository = repository;
        this.CheckOnline = (id, oId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.CheckOnline(id, oId);
            }
            catch (error) {
                console.error("Error in CheckOnline:", error);
                return false;
            }
        });
        this.offlineUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.offlineUser(userId);
            }
            catch (error) {
                throw error;
            }
        });
        this.onlineUser = (uId, pId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.onlineUser(uId, pId);
            }
            catch (error) {
                throw error;
            }
        });
        this.getMessageNotification = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const getMessageNotification = yield this._repository.getMessageNotification(userId);
                return getMessageNotification;
            }
            catch (error) {
                throw error;
            }
        });
        this.chatWithPerformer = (userId, performerId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.chatWithPerformer(userId, performerId);
            }
            catch (error) {
                throw error;
            }
        });
        this.getAllChatRooms = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this._repository.getAllChatRooms(userId);
            }
            catch (error) {
                throw error;
            }
        });
        this.ChatWith = (myIdObject, anotherIdObject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chatwith = yield this._repository.ChatWith(myIdObject, anotherIdObject);
                return chatwith;
            }
            catch (error) {
                throw error;
            }
        });
        this.sendMessage = (senderId, reseverId, message) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this._repository.sendMessage(senderId, reseverId, message);
            }
            catch (error) {
                throw error;
            }
        });
        this._repository = repository;
    }
}
exports.chatUseCase = chatUseCase;
