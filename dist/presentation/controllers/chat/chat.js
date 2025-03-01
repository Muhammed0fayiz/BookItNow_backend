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
exports.ChatController = void 0;
const responseStatus_1 = require("../../../constants/responseStatus");
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("../../../shared/utils/constant");
class ChatController {
    constructor(useCase) {
        this.useCase = useCase;
        this.sendMessage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { sender, receiver } = req.params;
                const senderId = new mongoose_1.default.Types.ObjectId(sender);
                const receiverId = new mongoose_1.default.Types.ObjectId(receiver);
                const { message } = req.body;
                if (!message) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ error: "Message is required" });
                }
                const sentMessage = yield this._useCase.sendMessage(senderId, receiverId, message);
                return res
                    .status(responseStatus_1.ResponseStatus.OK)
                    .json({ message: constant_1.MessageConstants.MESSAGE_SENT_SUCCESS, data: sentMessage });
            }
            catch (error) {
                console.error("Error in sendMessage:", error);
                next(error);
            }
        });
        this.chatWithPerformer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userid, performerid } = req.params;
                const userId = new mongoose_1.default.Types.ObjectId(userid);
                const performerId = new mongoose_1.default.Types.ObjectId(performerid);
                const performerMessage = yield this._useCase.chatWithPerformer(userId, performerId);
                res.status(responseStatus_1.ResponseStatus.OK).json({
                    success: true,
                    message: constant_1.MessageConstants.MESSAGE_SENT_SUCCESS,
                    data: performerMessage,
                });
            }
            catch (error) {
                console.error("Error in chatWithPerformer:", error);
                next(error);
            }
        });
        this.chatWith = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { myId, anotherId } = req.params;
                const myIdObject = new mongoose_1.default.Types.ObjectId(myId);
                const anotherIdObject = new mongoose_1.default.Types.ObjectId(anotherId);
                const chatting = yield this._useCase.ChatWith(myIdObject, anotherIdObject);
                res
                    .status(responseStatus_1.ResponseStatus.OK)
                    .json({ message: constant_1.MessageConstants.CHAT_FETCH_SUCCESS, data: chatting });
            }
            catch (error) {
                // Handle errors
                console.error(error);
                next(error);
            }
        });
        this.getAllChatRooms = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ error: "Invalid user ID" });
                }
                const userId = new mongoose_1.default.Types.ObjectId(id);
                const allRooms = yield this._useCase.getAllChatRooms(userId);
                return res.status(responseStatus_1.ResponseStatus.OK).json({ success: true, data: allRooms });
            }
            catch (error) {
                next(error);
            }
        });
        this.onlineUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, anotherId } = req.params;
                if (!userId || !anotherId) {
                    return res.status(400).json({ message: "Both userId and anotherId are required." });
                }
                if (!mongoose_1.default.isValidObjectId(userId) || !mongoose_1.default.isValidObjectId(anotherId)) {
                    return res.status(400).json({ message: "Invalid userId or anotherId format." });
                }
                const uId = new mongoose_1.default.Types.ObjectId(userId);
                const pId = new mongoose_1.default.Types.ObjectId(anotherId);
                const result = yield this._useCase.onlineUser(uId, pId);
                if (result) {
                    return res
                        .status(responseStatus_1.ResponseStatus.OK)
                        .json({ message: constant_1.MessageConstants.USER_STATUS_UPDATED, data: result });
                }
                else {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: "User not found." });
                }
            }
            catch (error) {
                console.error("Error in onlineUser:", error);
                next(error);
            }
        });
        this.offlineUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = new mongoose_1.default.Types.ObjectId(id);
                const result = yield this._useCase.offlineUser(userId);
                if (result) {
                    return res
                        .status(responseStatus_1.ResponseStatus.OK)
                        .json({ message: constant_1.MessageConstants.USER_STATUS_UPDATED, data: result });
                }
                else {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: "User not found." });
                }
            }
            catch (error) {
                console.error("Error in offline:", error);
                next(error);
            }
        });
        this.getMessgeNotification = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = new mongoose_1.default.Types.ObjectId(id);
                const messageNotification = yield this._useCase.getMessageNotification(userId);
                res.status(responseStatus_1.ResponseStatus.OK).json({ success: true, data: messageNotification });
            }
            catch (error) {
                next(error);
            }
        });
        this.checkOnlineUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, otherId } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(userId) ||
                    !mongoose_1.default.Types.ObjectId.isValid(otherId)) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: "Invalid user ID or other ID" });
                }
                console.log(userId, "dd", otherId);
                const oId = new mongoose_1.default.Types.ObjectId(otherId);
                const id = new mongoose_1.default.Types.ObjectId(userId);
                const onlineUser = yield this._useCase.CheckOnline(id, oId);
                console.log(onlineUser);
                return res.status(responseStatus_1.ResponseStatus.OK).json({ onlineUser });
            }
            catch (error) {
                console.error("Error in checkOnlineUser:", error);
                next(error);
            }
        });
        this._useCase = useCase;
    }
}
exports.ChatController = ChatController;
