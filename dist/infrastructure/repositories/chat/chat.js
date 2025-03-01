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
exports.chatRepository = void 0;
const userModel_1 = require("../../models/userModel");
const performerModel_1 = require("../../models/performerModel");
const chatRoomModel_1 = require("../../models/chatRoomModel");
const messageModel_1 = require("../../models/messageModel");
class chatRepository {
    constructor() {
        this.chatWithPerformer = (userId, performerId) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if a chat room exists
                let chatRoom = yield chatRoomModel_1.ChatRoomModel.findOne({
                    participants: { $all: [userId, performerId] },
                });
                // If no chat room exists, create one
                if (!chatRoom) {
                    chatRoom = new chatRoomModel_1.ChatRoomModel({
                        participants: [userId, performerId],
                    });
                    yield chatRoom.save();
                }
                const userMessage = new messageModel_1.MessageModel({
                    roomId: chatRoom._id,
                    senderId: userId,
                    receiverId: performerId,
                    message: "Hi",
                });
                yield userMessage.save();
                const user = yield userModel_1.UserModel.findById(userId);
                if (!user) {
                    throw new Error("User not found");
                }
                const performerReply = new messageModel_1.MessageModel({
                    roomId: chatRoom._id,
                    senderId: performerId,
                    receiverId: userId,
                    message: `Hi ${user.username}, how can I help you?`,
                });
                yield performerReply.save();
                const populatedChatRoom = yield chatRoomModel_1.ChatRoomModel.findById(chatRoom._id).populate("participants");
                return populatedChatRoom;
            }
            catch (error) {
                throw error;
            }
        });
        this.CheckOnline = (id, oId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chatRoom = yield chatRoomModel_1.ChatRoomModel.findOne({
                    participants: { $all: [id, oId] },
                });
                if (!chatRoom) {
                    return false;
                }
                return chatRoom.online.includes(oId);
            }
            catch (error) {
                console.error("Error in CheckOnline:", error);
                throw new Error("Unable to check online status.");
            }
        });
        this.offlineUser = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedRooms = yield chatRoomModel_1.ChatRoomModel.updateMany({ participants: userId }, { $pull: { online: userId } }, { new: true });
                console.log("up", updatedRooms);
                if (updatedRooms.modifiedCount > 0) {
                    return yield chatRoomModel_1.ChatRoomModel.find({ participants: userId });
                }
                return null;
            }
            catch (error) {
                throw error;
            }
        });
        this.onlineUser = (uId, pId) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield chatRoomModel_1.ChatRoomModel.updateMany({ participants: uId }, { $pull: { online: uId } }, { new: true });
                const userRoom = yield chatRoomModel_1.ChatRoomModel.findOne({
                    participants: { $all: [uId, pId] },
                });
                console.log('usrroom', userRoom);
                if (!userRoom) {
                    return null;
                }
                if (userRoom.online.includes(uId)) {
                    return userRoom;
                }
                userRoom.online.push(uId);
                yield userRoom.save();
                return userRoom;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
        this.getMessageNotification = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const unreadMessages = yield messageModel_1.MessageModel.aggregate([
                    {
                        $match: {
                            receiverId: userId,
                            read: false,
                        },
                    },
                    {
                        $group: {
                            _id: "$senderId",
                            numberOfMessages: { $sum: 1 },
                        },
                    },
                ]);
                if (unreadMessages.length === 0) {
                    return null;
                }
                const totalCount = unreadMessages.reduce((sum, msg) => sum + msg.numberOfMessages, 0);
                const notifications = unreadMessages.map((msg) => ({
                    userId: msg._id.toString(),
                    numberOfMessages: msg.numberOfMessages,
                }));
                return {
                    totalCount,
                    notifications,
                };
            }
            catch (error) {
                console.error("Error fetching message notifications:", error);
                throw error;
            }
        });
        this.getAllChatRooms = (userId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chatRooms = yield chatRoomModel_1.ChatRoomModel.find({ participants: userId });
                const chatRoomsWithMessages = yield Promise.all(chatRooms.map((chatRoom) => __awaiter(this, void 0, void 0, function* () {
                    const lastMessage = yield messageModel_1.MessageModel.findOne({
                        roomId: chatRoom._id,
                    }).sort({ timestamp: -1 });
                    const otherParticipantId = chatRoom.participants.find((id) => id.toString() !== userId.toString());
                    const otherParticipant = yield userModel_1.UserModel.findById(otherParticipantId);
                    const performer = yield performerModel_1.PerformerModel.findOne({
                        userId: otherParticipantId,
                    });
                    return {
                        chatRoom,
                        lastMessageTimestamp: lastMessage
                            ? lastMessage.timestamp
                            : new Date(0), // Use epoch if no messages
                        profileImage: (otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant.profileImage) || null, // Use user's profile image
                        userName: otherParticipant ? otherParticipant.username : null,
                        performerName: performer ? performer.bandName : null,
                        otherId: otherParticipantId ? otherParticipantId.toString() : null, // Convert to string
                    };
                })));
                // Sort chat rooms by the timestamp of their latest message (most recent first)
                const sortedChatRooms = chatRoomsWithMessages
                    .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime())
                    .map((room) => ({
                    profileImage: room.profileImage,
                    userName: room.userName,
                    performerName: room.performerName,
                    otherId: room.otherId,
                    myId: userId ? userId.toString() : null,
                }));
                return sortedChatRooms;
            }
            catch (error) {
                console.error("Error fetching chat rooms:", error);
                return null;
            }
        });
        this.ChatWith = (myIdObject, anotherIdObject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield messageModel_1.MessageModel.updateMany({ receiverId: myIdObject, senderId: anotherIdObject, read: false }, { $set: { read: true } });
                const chatMessages = yield messageModel_1.MessageModel.find({
                    $or: [
                        { senderId: myIdObject, receiverId: anotherIdObject },
                        { senderId: anotherIdObject, receiverId: myIdObject },
                    ],
                }).sort({ timestamp: 1 });
                const messagesWithRole = chatMessages.map((message) => {
                    if (message.senderId.toString() === myIdObject.toString()) {
                        return Object.assign(Object.assign({}, message.toObject()), { role: "sender" });
                    }
                    else {
                        return Object.assign(Object.assign({}, message.toObject()), { role: "receiver" });
                    }
                });
                console.log('s3dfsfdasfdasfdsfdsfds', messagesWithRole);
                return messagesWithRole;
            }
            catch (error) {
                throw error;
            }
        });
        this.sendMessage = (senderId, receiverId, message) => __awaiter(this, void 0, void 0, function* () {
            try {
                let chatRoom = yield chatRoomModel_1.ChatRoomModel.findOne({
                    participants: { $all: [senderId, receiverId] },
                });
                if (!chatRoom) {
                    chatRoom = new chatRoomModel_1.ChatRoomModel({
                        participants: [senderId, receiverId],
                    });
                    yield chatRoom.save();
                }
                const isReceiverOnline = chatRoom.online.includes(receiverId);
                const newMessage = new messageModel_1.MessageModel({
                    roomId: chatRoom._id,
                    senderId,
                    receiverId,
                    message,
                    read: isReceiverOnline,
                });
                yield newMessage.save();
                const populatedChatRoom = yield chatRoomModel_1.ChatRoomModel.findById(chatRoom._id).populate("participants");
                return populatedChatRoom;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.chatRepository = chatRepository;
