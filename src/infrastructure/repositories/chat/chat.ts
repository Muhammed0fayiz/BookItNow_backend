import { IChatRepository } from "../../../application/interfaces/chat/IchatRepositary";

import { UserModel } from "../../models/userModel";

import mongoose from "mongoose";

import { PerformerModel } from "../../models/performerModel";


import { ChatRoomDocument, ChatRoomModel } from "../../models/chatRoomModel";
import { MessageModel } from "../../models/messageModel";
import { ChatRoom } from "../../../domain/entities/chatRoom";

import { MessageNotification } from "../../../domain/entities/messageNotification";


export class chatRepository implements IChatRepository {
  chatWithPerformer = async (
    userId: mongoose.Types.ObjectId,
    performerId: mongoose.Types.ObjectId
  ): Promise<ChatRoomDocument | null> => {
    try {
      // Check if a chat room exists
      let chatRoom = await ChatRoomModel.findOne({
        participants: { $all: [userId, performerId] },
      });

      // If no chat room exists, create one
      if (!chatRoom) {
        chatRoom = new ChatRoomModel({
          participants: [userId, performerId],
        });
        await chatRoom.save();
      }

      const userMessage = new MessageModel({
        roomId: chatRoom._id,
        senderId: userId,
        receiverId: performerId,
        message: "Hi",
      });
      await userMessage.save();

      const user = await UserModel.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const performerReply = new MessageModel({
        roomId: chatRoom._id,
        senderId: performerId,
        receiverId: userId,
        message: `Hi ${user.username}, how can I help you?`,
      });
      await performerReply.save();

      const populatedChatRoom = await ChatRoomModel.findById(
        chatRoom._id
      ).populate("participants");

      return populatedChatRoom;
    } catch (error) {
      throw error;
    }
  };
  CheckOnline = async (
    id: mongoose.Types.ObjectId,
    oId: mongoose.Types.ObjectId
  ): Promise<boolean> => {
    try {
      const chatRoom = await ChatRoomModel.findOne({
        participants: { $all: [id, oId] },
      });

      if (!chatRoom) {
        return false;
      }

      return chatRoom.online.includes(oId);
    } catch (error) {
      console.error("Error in CheckOnline:", error);
      throw new Error("Unable to check online status.");
    }
  };
  offlineUser = async (
    userId: mongoose.Types.ObjectId
  ): Promise<ChatRoom[] | null> => {
    try {
      const updatedRooms = await ChatRoomModel.updateMany(
        { participants: userId },
        { $pull: { online: userId } },
        { new: true }
      );
      console.log("up", updatedRooms);

      if (updatedRooms.modifiedCount > 0) {
        return await ChatRoomModel.find({ participants: userId });
      }

      return null;
    } catch (error) {
      throw error;
    }
  };
  onlineUser = async (
    uId: mongoose.Types.ObjectId,
    pId: mongoose.Types.ObjectId
  ): Promise<ChatRoomDocument|null> => {
    try {
    await ChatRoomModel.updateMany(
        { participants: uId },
        { $pull: { online: uId } },
        { new: true }
      );


  
      
      const userRoom = await ChatRoomModel.findOne({
        participants: { $all: [uId, pId] },
      });
      console.log('usrroom',userRoom);
      

      if (!userRoom) {
        return null;
      }

      if (userRoom.online.includes(uId)) {
        return userRoom;
      }

      userRoom.online.push(uId);
      await userRoom.save();

      return userRoom;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  getMessageNotification = async (
    userId: mongoose.Types.ObjectId
  ): Promise<MessageNotification | null> => {
    try {
      const unreadMessages = await MessageModel.aggregate([
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

      const totalCount = unreadMessages.reduce(
        (sum, msg) => sum + msg.numberOfMessages,
        0
      );

      const notifications = unreadMessages.map((msg) => ({
        userId: msg._id.toString(),
        numberOfMessages: msg.numberOfMessages,
      }));

      return {
        totalCount,
        notifications,
      };
    } catch (error) {
      console.error("Error fetching message notifications:", error);
      throw error;
    }
  };
  getAllChatRooms = async (
    userId: mongoose.Types.ObjectId
  ): Promise<ChatRoom[] | null> => {
    try {
      const chatRooms = await ChatRoomModel.find({ participants: userId });

      const chatRoomsWithMessages = await Promise.all(
        chatRooms.map(async (chatRoom) => {
          const lastMessage = await MessageModel.findOne({
            roomId: chatRoom._id,
          }).sort({ timestamp: -1 });

          const otherParticipantId = chatRoom.participants.find(
            (id) => id.toString() !== userId.toString()
          );
          const otherParticipant = await UserModel.findById(otherParticipantId);

          const performer = await PerformerModel.findOne({
            userId: otherParticipantId,
          });

          return {
            chatRoom,
            lastMessageTimestamp: lastMessage
              ? lastMessage.timestamp
              : new Date(0), // Use epoch if no messages
            profileImage: otherParticipant?.profileImage || null, // Use user's profile image
            userName: otherParticipant ? otherParticipant.username : null,
            performerName: performer ? performer.bandName : null,
            otherId: otherParticipantId ? otherParticipantId.toString() : null, // Convert to string
          };
        })
      );

      // Sort chat rooms by the timestamp of their latest message (most recent first)
      const sortedChatRooms = chatRoomsWithMessages
        .sort(
          (a, b) =>
            b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()
        )
        .map((room) => ({
          profileImage: room.profileImage,
          userName: room.userName,
          performerName: room.performerName,
          otherId: room.otherId,
          myId: userId ? userId.toString() : null,
        }));

      return sortedChatRooms;
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      return null;
    }
  };
  ChatWith = async (
    myIdObject: mongoose.Types.ObjectId,
    anotherIdObject: mongoose.Types.ObjectId
  ): Promise<any[] | null> => {
    try {
      await MessageModel.updateMany(
        { receiverId: myIdObject, senderId: anotherIdObject, read: false },
        { $set: { read: true } }
      );

      const chatMessages = await MessageModel.find({
        $or: [
          { senderId: myIdObject, receiverId: anotherIdObject },
          { senderId: anotherIdObject, receiverId: myIdObject },
        ],
      }).sort({ timestamp: 1 });

      const messagesWithRole = chatMessages.map((message) => {
        if (message.senderId.toString() === myIdObject.toString()) {
          return { ...message.toObject(), role: "sender" };
        } else {
          return { ...message.toObject(), role: "receiver" };
        }
      });
console.log('s3dfsfdasfdasfdsfdsfds',messagesWithRole)
      return messagesWithRole;
    } catch (error) {
      throw error;
    }
  };
  sendMessage = async (
    senderId: mongoose.Types.ObjectId,
    receiverId: mongoose.Types.ObjectId,
    message: string
  ): Promise<ChatRoomDocument | null> => {
    try {
      let chatRoom = await ChatRoomModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!chatRoom) {
        chatRoom = new ChatRoomModel({
          participants: [senderId, receiverId],
        });
        await chatRoom.save();
      }

      const isReceiverOnline = chatRoom.online.includes(receiverId);

      const newMessage = new MessageModel({
        roomId: chatRoom._id,
        senderId,
        receiverId,
        message,
        read: isReceiverOnline,
      });

      await newMessage.save();

      const populatedChatRoom = await ChatRoomModel.findById(
        chatRoom._id
      ).populate("participants");

      return populatedChatRoom;
    } catch (error) {
      throw error;
    }
  };
}
