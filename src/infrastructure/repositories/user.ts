import { UpcomingEvent } from "./../../domain/entities/performerupcomingevent";

import { UpcomingEventDocument } from "./../../domain/entities/upcomingevent";
import { TempPerformerDocument } from "./../models/tempPerformer";

import { IuserRepository } from "../../application/interfaces/IuserRepository";
import { User, UserDocument } from "../../domain/entities/user";
import { OtpUser } from "../../domain/entities/otpUser";

import { UserDocuments, UserModel } from "../models/userModel";
import bcrypt from "bcrypt";

import { TempPerformerModel } from "../models/tempPerformer";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { generateOTP } from "../../shared/utils/generateOtp";
import { tempUserModel } from "../models/tempUser";
import mongoose, { Types } from "mongoose";
import { EventDocument, EventModel } from "../models/eventsModel";
import { PerformerModel } from "../models/performerModel";
import { Performer } from "../../domain/entities/performer";
import { BookingDocument, BookingModel } from "../models/bookingEvents";
import { AdminModel } from "../models/adminModel";
import { WalletDocument, WalletModel } from "../models/walletHistory";
import { SlotModel } from "../models/slotModel";
import { FavoriteDocument, FavoriteModel } from "../models/FavoriteScema";
import { ChatRoomDocument, ChatRoomModel } from "../models/chatRoomModel";
import { MessageDocument, MessageModel } from "../models/messageModel";
import { ChatRoom } from "../../domain/entities/chatRoom";
import { RatingModel } from "../models/ratingModel";

export class userRepository implements IuserRepository {
  // chatWithPerformer=async(userId: mongoose.Types.ObjectId, performerId: mongoose.Types.ObjectId): Promise<ChatRoomDocument | null>=> {
  //   try {
      
  //   } catch (error) {
  //     throw error
  //   }
  // }
  getAllChatRooms = async (userId: mongoose.Types.ObjectId): Promise<ChatRoom[] | null> => {
    try {
    
      const chatRooms = await ChatRoomModel.find({ participants: userId });
  
  
      const chatRoomsWithMessages = await Promise.all(
        chatRooms.map(async (chatRoom) => {
       
          const lastMessage = await MessageModel.findOne({ roomId: chatRoom._id })
            .sort({ timestamp: -1 }); 
  
         
          const otherParticipantId = chatRoom.participants.find(id => id.toString() !== userId.toString());
          const otherParticipant = await UserModel.findById(otherParticipantId);
  
          // Step 4: Find performer linked to this chat room (if any)
          const performer = await PerformerModel.findOne({
            userId: otherParticipantId,
          });
  
          // Return an object with last message timestamp for sorting
          return {
            chatRoom,
            lastMessageTimestamp: lastMessage ? lastMessage.timestamp : new Date(0), // Use epoch if no messages
            profileImage: otherParticipant?.profileImage || null, // Use user's profile image
            userName: otherParticipant ? otherParticipant.username : null,
            performerName: performer ? performer.bandName : null,
            otherId: otherParticipantId ? otherParticipantId.toString() : null  // Convert to string
          };
        })
      );
  
      // Sort chat rooms by the timestamp of their latest message (most recent first)
      const sortedChatRooms = chatRoomsWithMessages
        .sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime())
        .map(room => ({
          profileImage: room.profileImage,
          userName: room.userName,
          performerName: room.performerName,
          otherId: room.otherId,
          myId: userId ? userId.toString() : null
        }));
  
      return sortedChatRooms;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return null;
    }
  };
  ChatWith = async (myIdObject: mongoose.Types.ObjectId, anotherIdObject: mongoose.Types.ObjectId): Promise<any[] | null> => {
    try {

      const chatMessages = await MessageModel.find({
        $or: [
          { senderId: myIdObject, receiverId: anotherIdObject },
          { senderId: anotherIdObject, receiverId: myIdObject }
        ]
      }).sort({ timestamp: 1 });

    
      const messagesWithRole = chatMessages.map((message) => {
        if (message.senderId.toString() === myIdObject.toString()) {
         
          return { ...message.toObject(), role: 'sender' };
        } else {
         
          return { ...message.toObject(), role: 'receiver' };
        }
      });
  
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
      // Check if a chat room already exists
      let chatRoom = await ChatRoomModel.findOne({
        participants: { $all: [senderId, receiverId] },
      });
  
      // If no room exists, create one
      if (!chatRoom) {
        chatRoom = new ChatRoomModel({
          participants: [senderId, receiverId],
        });
        await chatRoom.save();
      }
  
      // Save the message in the MessageModel
      const newMessage = new MessageModel({
        roomId: chatRoom._id,
        senderId,
        receiverId,
        message,
      });
  
      await newMessage.save();
  
      // Optionally populate chat room details (e.g., messages)
      const populatedChatRoom = await ChatRoomModel.findById(chatRoom._id).populate('participants');
  
      return populatedChatRoom;
    } catch (error) {
      throw error;
    }
  };
  favaroiteEvents = async (
    id: Types.ObjectId
  ): Promise<EventDocument[] | null> => {
    try {

      const favoriteEvents = await FavoriteModel.find({ userId: id })

      const eventIds = favoriteEvents.map((favorite) => favorite.eventId);
  
 
      const events = await EventModel.find({ _id: { $in: eventIds } });
  
      return events;
    } catch (error) {
      console.error('Error fetching favorite events:', error);
      throw error;
    }
  };


  toggleFavoriteEvent = async (
    userId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId
  ): Promise<FavoriteDocument | null> => {
    try {
      // Check if the favorite event already exists
      const existingFavorite = await FavoriteModel.findOne({ userId, eventId });
  
      if (existingFavorite) {
       
        await FavoriteModel.deleteOne({ userId, eventId });
        return null; 
      } else {
       
        const newFavorite = await FavoriteModel.create({ userId, eventId });
        return newFavorite; 
      }
    } catch (error) {
      throw error; 
    }
  };
  


  ratingAdded = async (
    bookingId: mongoose.Types.ObjectId,
    rating: number,
    review: string
  ): Promise<EventDocument | null> => {
    try {
      const bookingevent = await BookingModel.findByIdAndUpdate(
        bookingId,
        { isRated: true }, 
        { new: true } 
      );
  
      const eventId = bookingevent?.eventId;
      if (!eventId) {
        console.error("Event ID not found in booking");
        return null;
      }
  
      const event = await EventModel.findById(eventId);
      if (!event) {
        console.error("Event not found");
        return null;
      }
  
      const ratingDoc = new RatingModel({
        eventId: eventId,
        userId: bookingevent.userId,
        rating: rating,
        review: review,
      });
  
      await ratingDoc.save();
  
      const totalRating = event.rating * event.totalReviews + rating;
      const newRatedCount = event.totalReviews + 1;
      const newAverageRating = totalRating / newRatedCount;
  
      event.rating = newAverageRating;
      event.totalReviews = newRatedCount;
  
      await event.save();
  
      const userId = event.userId;
      if (userId) {
        const performer = await PerformerModel.findOne({ userId });
        if (performer) {
          const totalPerformerRating = performer.rating * performer.totalReviews + rating;
          const newTotalReviews = performer.totalReviews + 1;
          const newPerformerAverageRating = totalPerformerRating / newTotalReviews;
  
          performer.rating = newPerformerAverageRating;
          performer.totalReviews = newTotalReviews;
  
          await performer.save();
        } else {
          console.error("Performer not found for userId:", userId);
        }
      }
  
      return event;
    } catch (error) {
      console.error("Error in ratingAdded:", error);
      throw error;
    }
  };
  

  availableDate = async (
    formData: Record<string, any>,
    eventId: string,
    performerId: string
  ): Promise<boolean> => {
    try {
      const performer = await PerformerModel.findOne({ userId: performerId });
      if (!performer) {
        throw new Error("Performer not found");
      }

      const existingBooking = await BookingModel.findOne({
        performerId: performer._id,
        date: formData.date,
      });

      if (existingBooking) {
        return false;
      }

      const slotDocument = await SlotModel.findOne({
        performerId: performer._id,
      });

      if (slotDocument && Array.isArray(slotDocument.dates)) {
        const inputDate = new Date(formData.date).setHours(0, 0, 0, 0);

        const isDateExist = slotDocument.dates.some((date) => {
          const slotDate = new Date(date).setHours(0, 0, 0, 0);
          return slotDate === inputDate;
        });

        console.log("hello check");
        console.log(formData.date, "id");
        if (isDateExist) {
          console.log("true", existingBooking, "hari");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw error;
    }
  };


  getAllPerformer = async (
    id: mongoose.Types.ObjectId
  ): Promise<Performer[] | null> => {
    try {
      const performers = await PerformerModel.find({ userId: { $ne: id } });

      return performers;
    } catch (error) {
      throw error;
    }
  };

  getAllEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<EventDocument[] | null> => {
    try {
      const allEvents = await EventModel.find({
        isblocked: false,
        isperformerblockedevents: false,
        userId: { $ne: id },
      });

      const validEvents: EventDocument[] = [];
      for (const event of allEvents) {
        const performer = await UserModel.findById(event.userId);
        if (performer && !performer.isPerformerBlocked) {
          validEvents.push(event);
        }
      }

      return validEvents;
    } catch (error) {
      console.error("Error fetching events:", error);
      return null;
    }
  };
  updateUserPassword = async (
    id: mongoose.Types.ObjectId,
    newPassword: string
  ): Promise<UserDocuments | null> => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  };

  resendOtp = async (email: string, otp: string): Promise<User | null> => {
    let b = await tempUserModel.find();

    try {
      console.log("otp", otp);
      console.log("email", email);
      const otpUser = await tempUserModel.findOne({ email });

      // Making the email case-insensitive
      let m = await tempUserModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!m) {
        throw new Error("User not found");
      }

      // Update OTP
      const result = await tempUserModel.findOneAndUpdate(
        { email: m.email },
        { otp: otp }, // Use the provided otp
        { new: true }
      );

      return result as unknown as User | null;
    } catch (error) {
      throw error;
    }
  };

  getTempPerformer = async (): Promise<TempPerformerDocument[] | null> => {
    try {
      const tmp = await TempPerformerModel.find();
      if (tmp) {
        return tmp;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  getUserDetails = async (id: any): Promise<UserDocuments | null> => {
    try {
      const user = await UserModel.findById(id).lean().exec();

      if (!user) throw new Error("User not found");
      return user ? user : null;
    } catch (error) {
      console.error("error occured");
      return null;
    }
  };

  loginUser = async (
    email: string,
    password: string
  ): Promise<User | null | string> => {
    try {
      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return null;
      } else if (user.isblocked) {
        return "User Is Blocked";
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return null;
      }

      return {
        username: user.username,
        email: user.email,
        password: user.password,
        _id: user._id?.toString(),
        isVerified: user.isVerified,
        isblocked: user.isblocked,
      };
    } catch (error) {
      throw error;
    }
  };

  tempUserExist = async (email: string): Promise<OtpUser | null> => {
    try {
      const tempUser = await tempUserModel.findOne({ email: email });
      if (!tempUser) {
        return null;
      }
      return new OtpUser(
        tempUser.username,
        tempUser.email,
        tempUser.password,
        tempUser._id?.toString(), // ID is optional, convert to string if it exists
        tempUser.otp // Include the otp
      );
    } catch (error) {
      console.error("Error finding temp user:", error);
      throw error; // Rethrow or handle the error as needed
    }
  };

  checkOtp = async (user: {
    email: string;
    otp: string;
    password: string;
    username: string;
  }): Promise<User | null> => {
    try {
      const otpUser = await tempUserModel.findOne({
        email: user.email,
        otp: user.otp,
      });

      if (otpUser !== null) {
        const insertedUser = await this.insertUser(
          otpUser.email,
          otpUser.password,
          otpUser.username
        );

        if (insertedUser) {
          await tempUserModel.deleteOne({ email: user.email, otp: user.otp });
        }

        return insertedUser;
      }

      return null;
    } catch (error) {
      throw error;
    }
  };

  insertUser = async (
    email: string,
    password: string,
    username: string
  ): Promise<User | null> => {
    try {
      const user = {
        email: email,
        password: password,
        username: username,
        isVerified: false,
        isblocked: false,
      };

      const userData = await UserModel.insertMany([user]);

      if (userData && userData.length > 0) {
        const insertedUser = userData[0].toObject() as unknown as UserDocument;
        return new User(
          insertedUser.username,
          insertedUser.email,
          insertedUser.password,
          insertedUser.isVerified,
          insertedUser.isblocked
        );
      }

      return null;
    } catch (error) {
      throw error;
    }
  };

  OtpUser = async (
    mail: string,
    otp: string,
    password: string,
    username: string
  ): Promise<OtpUser | null> => {
    try {
      const otpUser = {
        email: mail,
        otp: otp,
        username: username,
        password: password,
      };

      const tempUserData = await tempUserModel.insertMany([otpUser]);

      if (tempUserData && tempUserData.length > 0) {
        return new OtpUser(
          otpUser.email,
          otpUser.otp,
          otpUser.password,
          otpUser.username
        );
      }

      return null;
    } catch (error) {
      throw error;
    }
  };

  userExist = async (email: string): Promise<User | null> => {
    try {
      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return null;
      }
      return new User(
        user.username,
        user.email,
        user.password,
        user.isVerified,
        user.isblocked,
        user._id?.toString()
      );
    } catch (error) {
      throw error;
    }
  };


  getAllUpcomingEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<UpcomingEventDocument[] | null> => {
    try {
      console.log('upcomeing')
      const currentDate = new Date();

      const bookings = await BookingModel.find({
        userId: id,
        date: { $gte: currentDate },
      })
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .lean();
        console.log('upcomeing888')
      const upcomingEvents: UpcomingEventDocument[] = bookings.map(
        (booking) => {
          const event = booking.eventId as any;
          console.log('upcomeing444',event)
          return {
            _id: booking._id,
            eventId: booking.eventId,
            performerId: booking.performerId,
            userId: booking.userId,
            price: booking.price,
            status: event.status,
            teamLeader: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            rating: event.rating,
            description: event.description,
            imageUrl: event.imageUrl,
            isblocked: event.isblocked,
            advancePayment: booking.advancePayment,
            restPayment: booking.restPayment,
            time: booking.time,
            place: booking.place,
            date: booking.date,
            bookingStatus: booking.bookingStatus,
            isRated: booking.isRated,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            title: event.title,
            category: event.category,
          } as unknown as UpcomingEventDocument;
        }
      );

      console.log("Upcoming Events:", upcomingEvents);
      return upcomingEvents;
    } catch (error) {
      console.error("Error in getAllUpcomingEvents:", error);
      throw error;
    }
  };

  cancelEvent = async (
    id: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null> => {
    try {
      const today = new Date();
      const event = await BookingModel.findById(id);


      if (!event) {
        return null;
      }

      const dateDifferenceInDays = Math.floor(
        (event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const { userId, performerId, advancePayment } = event;

  
      if (!userId) {
        return null;
      }

      if (dateDifferenceInDays > 9) {

        await UserModel.findByIdAndUpdate(userId, {
          $inc: { walletBalance: advancePayment },
        });


        const walletEntry = new WalletModel({
          userId,
          amount: advancePayment,
          transactionType: "credit",
          role: "user",
          date: today,
          description: "event booking cancelled ",
        });
        await walletEntry.save();

      
        event.bookingStatus = "canceled";
        const updatedEvent = await event.save();

        return updatedEvent;
      }

      if (dateDifferenceInDays < 0) {
        return null;
      }


      const performer = await PerformerModel.findById(performerId);

      if (!performer) {
        return null;
      }

      const performerUserId = performer.userId;

      await UserModel.findByIdAndUpdate(performerUserId, {
        $inc: { walletBalance: advancePayment },
      });

      const performerWalletEntry = new WalletModel({
        userId: performerUserId,
        amount: advancePayment,
        transactionType: "credit",
        role: "performer",
        date: today,
        description: "user cancelled event",
      });
      await performerWalletEntry.save();

 
      event.bookingStatus = "canceled";
      const updatedEvent = await event.save();

      return updatedEvent;
    } catch (error) {
      console.error("Error canceling event:", error);
      throw error;
    }
  };
  walletHistory = async (
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null> => {
    try {
      const userWallet = await WalletModel.find({ userId: objectId });

      return userWallet;
    } catch (error) {
      throw error;
    }
  };

  getAlleventHistory = async (
    id: mongoose.Types.ObjectId
  ): Promise<UpcomingEventDocument[] | null> => {
    try {
      const currentDate = new Date(); // Get the current date

      const bookings = await BookingModel.find({
        userId: id,
        date: { $lt: currentDate }, // Filter for past events
      })
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .lean();

      const pastEventHistory: UpcomingEventDocument[] = bookings.map(
        (booking) => {
          const event = booking.eventId as any;

          return {
            _id: booking._id,
            eventId: booking.eventId,
            performerId: booking.performerId,
            userId: booking.userId,
            price: booking.price,
            status: event.status,
            teamLeader: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            rating: event.rating,
            description: event.description,
            imageUrl: event.imageUrl,
            isblocked: event.isblocked,
            advancePayment: booking.advancePayment,
            restPayment: booking.restPayment,
            time: booking.time,
            place: booking.place,
            date: booking.date,
            bookingStatus: booking.bookingStatus,
            isRated: booking.isRated,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            title: event.title,
            category: event.category,
          } as unknown as UpcomingEventDocument; 
        }
      );

      return pastEventHistory;
    } catch (error) {
      console.error("Error in getPastEventHistory:", error);
      throw error;
    }
  };

  userWalletBookEvent = async (
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null> => {
    try {

      const event = await EventModel.findById(eventId);

      const performer = await PerformerModel.findOne({ userId: performerId });

      if (!event) {
        throw new Error("Event not found");
      }
  
      if (!performer) {
        throw new Error("Performer not found");
      }
  
      const performerBookingDate = await BookingModel.find({
        performerId: performer._id,
        date: formData.date,
      });

      if (performerBookingDate.length > 0) {
     
        return null;
      }
  
      let slotDocument = await SlotModel.findOne({
        performerId: performer._id,
      });

      if (slotDocument && Array.isArray(slotDocument.dates)) {
        const inputDateString = new Date(formData.date).toISOString().split("T")[0];
        const isDateExist = slotDocument.dates.some((date) => {
          const slotDateString = new Date(date).toISOString().split("T")[0];
          return slotDateString === inputDateString;
        });
  
        if (isDateExist) {
          return null;
        }
      }
  
      const price = event.price;
      const advancePayment = (price * 10) / 100 - 10;
      const restPayment = price - (price * 10) / 100;
  
     
      const bookEvent = await BookingModel.create({
        eventId: event._id,
        performerId: performer._id,
        userId: userId,
        price: price,
        advancePayment: advancePayment,
        restPayment: restPayment,
        time: formData.time,
        place: formData.place,
        date: formData.date,
      });

      const currentDate = new Date().toISOString().split("T")[0];
  
    
      await AdminModel.updateOne(
        {},
        {
          $inc: { [`transactions.${currentDate}`]: 1, walletAmount: 10 },
        },
        { upsert: true }
      );
  
   
   await UserModel.findByIdAndUpdate(userId, {
        $inc: { walletBalance: -advancePayment },
      });
 
      const performerUserId = performer.userId;
      await UserModel.findByIdAndUpdate(performerUserId, {
        $inc: { walletBalance: advancePayment },
      });
  
      const userWalletEntry = new WalletModel({
        userId,
        amount: -advancePayment,
        transactionType: "debit",
        role: "user",
        date: new Date(),
        description: "Advance payment for event booking",
      });
      await userWalletEntry.save();
  
      // Log performer wallet transaction
      const performerWalletEntry = new WalletModel({
        userId: performerUserId,
        amount: advancePayment,
        transactionType: "credit",
        role: "performer",
        date: new Date(),
        description: "Advance payment received for event booking",
      });
      await performerWalletEntry.save();
  
      return bookEvent;
    } catch (error) {
      throw error;
    }
  };
  
  userBookEvent = async (
    formData: Record<string, any>,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null> => {
    try {
      const event = await EventModel.findById(eventId);
      const performer = await PerformerModel.findOne({ userId: performerId });

      console.log("form dat", formData);

      if (!event) {
        throw new Error("Event not found");
      }

      if (!performer) {
        throw new Error("Performer not found");
      }

      const performerBookingDate = await BookingModel.find({
        performerId: performer._id,
        date: formData.date,
      });

      if (performerBookingDate.length > 0) {
        return null;
      }
      let slotDocument = await SlotModel.findOne({
        performerId: performer._id,
      });
      console.log("Slot Document:", slotDocument);

      if (slotDocument && Array.isArray(slotDocument.dates)) {
        const inputDateString = new Date(formData.date)
          .toISOString()
          .split("T")[0];

        const isDateExist = slotDocument.dates.some((date) => {
          const slotDateString = new Date(date).toISOString().split("T")[0];
          return slotDateString === inputDateString;
        });

        if (isDateExist) {
          return null;
        } else {
          console.log(
            "Date does not exist in the slotDocument:",
            inputDateString
          );
        }
      } else {
        console.log(
          "SlotDocument not found or does not have a valid dates array"
        );
      }

      const price = event.price;
      const advancePayment = (price * 10) / 100 - 10;
      const restPayment = price - (price * 10) / 100;

      const bookEvent = await BookingModel.create({
        eventId: event._id,
        performerId: performer._id,
        userId: userId,
        price: price,
        advancePayment: advancePayment,
        restPayment: restPayment,
        time: formData.time,
        place: formData.place,
        date: formData.date,
      });

      const currentDate = new Date().toISOString().split("T")[0];

      const appcharge = await AdminModel.updateOne(
        {},
        {
          $inc: { [`transactions.${currentDate}`]: 1, walletAmount: 10 },
        },
        { upsert: true }
      );

      return bookEvent;
    } catch (error) {
      throw error;
    }
  };

}
