

import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";


import { IuserEventRepository } from "../../../application/interfaces/user/repositary/event";


import { UserDocuments, UserModel } from "../../models/userModel";



import mongoose, { Types } from "mongoose";
import { EventDocument, EventModel } from "../../models/eventsModel";
import { PerformerModel } from "../../models/performerModel";
import { Performer } from "../../../domain/entities/performer";
import { BookingDocument, BookingModel } from "../../models/bookingEvents";
import { AdminModel } from "../../models/adminModel";
import { WalletDocument, WalletModel } from "../../models/walletHistory";
import { SlotModel } from "../../models/slotModel";
import { FavoriteDocument, FavoriteModel } from "../../models/FavoriteScema";
import { RatingModel } from "../../models/ratingModel";
import { eventRating } from "../../../domain/entities/eventRating";

export class userEventRepository implements IuserEventRepository {
  getTopRatedEvent = async (userId:mongoose.Types.ObjectId): Promise<EventDocument[] | null> => {
    try {
      const allEvents = await EventModel.find({
        isblocked: false,
        isperformerblockedevents: false,
        userId: { $ne: userId},
      });

  
      const validEvents: EventDocument[] = [];
      for (const event of allEvents) {
        const performer = await UserModel.findById(event.userId);
        if (performer && !performer.isPerformerBlocked) {
          validEvents.push(event);
        }
      }
  
      validEvents.sort((a, b) => b.rating - a.rating);


      return validEvents.slice(0, 3);
    } catch (error) {
      console.error("Error fetching top-rated events:", error);
      return null;
    }
  };
  




  favaroiteEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<{ totalEvent: number; events: EventDocument[] | null }> => {
    try {
      const favoriteEvents = await FavoriteModel.find({ userId: id }).sort({
        _id: -1,
      });

      const totalEvent = await FavoriteModel.countDocuments({ userId: id });
      const eventIds = favoriteEvents.map((favorite) => favorite.eventId);
      const events = await EventModel.find({ _id: { $in: eventIds } });

      return { totalEvent, events };
    } catch (error) {
      console.error("Error fetching favorite events:", error);
      throw error;
    }
  };
  getUpcomingEvents = async (
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]> => {
    try {
      const currentDate = new Date();
      const pageSize = 8;
      const skip = (page - 1) * pageSize;

      const matchQuery = {
        userId: userId,
        date: { $gte: currentDate },
      };

      const bookings = await BookingModel.find(matchQuery)
        .sort({ date: 1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .lean();

      const upcomingEvents: UpcomingEventDocument[] = bookings.map(
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

      return upcomingEvents; 
    } catch (error) {
      console.error("Error in getUpcomingEvents:", error);
      throw error;
    }
  };
  getAllEventHistory = async (
    id: mongoose.Types.ObjectId
  ): Promise<{
    totalCount: number;
    pastEventHistory: UpcomingEventDocument[];
  }> => {
    try {
      const currentDate = new Date();
      const matchQuery = { userId: id, date: { $lt: currentDate } };
      const totalCount = await BookingModel.countDocuments(matchQuery);

      const bookings = await BookingModel.find(matchQuery)
        .sort({ date: -1 })
        .limit(8)
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

      return { totalCount, pastEventHistory };
    } catch (error) {
      console.error("Error in getAllEventHistory:", error);
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
        const inputDateString = new Date(formData.date)
          .toISOString()
          .split("T")[0];
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
  getEventHistory = async (
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<{
    totalCount: number;
    pastEventHistory: UpcomingEventDocument[];
  }> => {
    try {
      const currentDate = new Date();
      const pageSize = 8;
      const skip = (page - 1) * pageSize;

      const matchQuery = { userId: userId, date: { $lt: currentDate } };

      const totalCount = await BookingModel.countDocuments(matchQuery);

      const bookings = await BookingModel.find(matchQuery)
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize)
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

      return { totalCount, pastEventHistory };
    } catch (error) {
      console.error("Error in getEventHistory:", error);
      throw error;
    }
  };
  getFilteredEvents = async (
    id: mongoose.Types.ObjectId,
    filterOptions: any,
    sortOptions: any,
    skip: number,
    limit: number
  ): Promise<{ events: EventDocument[]; totalCount: number } | null> => {
    try {

      const totalCount = await EventModel.countDocuments({
        isblocked: false,
        isperformerblockedevents: false,
        userId: { $ne: id },
        ...filterOptions,
      });

      const allFilteredEvents = await EventModel.find({
        isblocked: false,
        isperformerblockedevents: false,
        userId: { $ne: id },
        ...filterOptions,
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);



      const validEvents: EventDocument[] = [];
      for (const event of allFilteredEvents) {
        const performer = await UserModel.findById(event.userId);
        if (performer && !performer.isPerformerBlocked) {
          validEvents.push(event);
        }
      }

      return { events: validEvents, totalCount };
    } catch (error) {
      console.error("Error fetching filtered events:", error);
      return null;
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
          const totalPerformerRating =
            performer.rating * performer.totalReviews + rating;
          const newTotalReviews = performer.totalReviews + 1;
          const newPerformerAverageRating =
            totalPerformerRating / newTotalReviews;

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
  getEventRating = async (
    eventId: mongoose.Types.ObjectId
  ): Promise<eventRating[] | null> => {
    try {
      const ratings = await RatingModel.find({ eventId })
        .sort({ _id: -1 })
        .limit(50)
        .populate<{ userId: { username: string; profileImage: string } }>(
          'userId',
          'username profileImage'
        )
        .lean();
  
      const eventRatings: eventRating[] = ratings.map((rating) => ({
        userName: rating.userId.username,
        profilePicture: rating.userId.profileImage,
        rating: rating.rating,
        review: rating.review,
        Date: rating.createdAt,
      }));
  
      return eventRatings;
    } catch (error) {
      throw error;
    }
  };
  
  
  getAllUpcomingEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<{
    totalCount: number;
    upcomingEvents: UpcomingEventDocument[];
  }> => {
    try {
      const currentDate = new Date();

      const matchQuery = {
        userId: id,
        date: { $gte: currentDate },
      };

      const totalCount = await BookingModel.countDocuments(matchQuery);

      const bookings = await BookingModel.find(matchQuery)
        .sort({ date: 1 })
        .limit(8)
        .populate({
          path: "eventId",
          model: "Event",
          select:
            "title category performerId status teamLeader teamLeaderNumber rating description imageUrl isblocked",
        })
        .populate("performerId", "name")
        .lean();

      const upcomingEvents: UpcomingEventDocument[] = bookings.map(
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

      return { totalCount, upcomingEvents };
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


  
  

  getFilteredPerformers = async (
    id: mongoose.Types.ObjectId,
    searchValue: any,
    sortOptions: any = { rating: -1 },
    skip: number,
    limit: number
  ): Promise<{ performers: Performer[]; totalCount: number } | null> => {
    try {
      const userId =
        typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
      const blockedUsers = await UserModel.find(
        { isPerformerBlocked: true },
        { _id: 1 }
      );
      const blockedUserIds = blockedUsers.map((user) => user._id);

      const combinedFilter: any = {
        userId: {
          $ne: userId,
          $nin: blockedUserIds,
        },
      };

      if (searchValue) {
        if (typeof searchValue === "string") {
          const searchStr = searchValue.trim();
          if (searchStr) {
            combinedFilter.$or = [
              { bandName: { $regex: searchStr, $options: "i" } },
              { place: { $regex: searchStr, $options: "i" } },
            ];
          }
        } else if (typeof searchValue === "object") {
          // Handle object search value
          if (searchValue.search) {
            const searchStr = searchValue.search.trim();
            combinedFilter.$or = [
              { bandName: { $regex: searchStr, $options: "i" } },
              { place: { $regex: searchStr, $options: "i" } },
            ];
          } else if (searchValue.$or) {
            combinedFilter.$or = searchValue.$or;
          }
        }
      }

      console.log(
        "Final Combined Filter:",
        JSON.stringify(combinedFilter, null, 2)
      );

      console.log("Executing count query...");
      const totalCount = await PerformerModel.countDocuments(combinedFilter);
      console.log("Total Count:", totalCount);

      console.log("Executing find query...");
      const performers = await PerformerModel.find(combinedFilter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select("userId bandName description profileImage place rating");

      console.log("Found Performers Count:", performers.length);
      if (performers.length > 0) {
        console.log("Sample Found Performer:", performers[0]);
      }

      if (!performers.length) {
        return null;
      }

      return { performers, totalCount };
    } catch (error) {
      console.error("Error in getFilteredPerformers:", error);
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

        if (isDateExist) {
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



  // chatWithPerformer = async (
  //   userId: mongoose.Types.ObjectId,
  //   performerId: mongoose.Types.ObjectId
  // ): Promise<ChatRoomDocument | null> => {
  //   try {
  //     // Check if a chat room exists
  //     let chatRoom = await ChatRoomModel.findOne({
  //       participants: { $all: [userId, performerId] },
  //     });

  //     // If no chat room exists, create one
  //     if (!chatRoom) {
  //       chatRoom = new ChatRoomModel({
  //         participants: [userId, performerId],
  //       });
  //       await chatRoom.save();
  //     }

  //     const userMessage = new MessageModel({
  //       roomId: chatRoom._id,
  //       senderId: userId,
  //       receiverId: performerId,
  //       message: "Hi",
  //     });
  //     await userMessage.save();

  //     const user = await UserModel.findById(userId);

  //     if (!user) {
  //       throw new Error("User not found");
  //     }

  //     const performerReply = new MessageModel({
  //       roomId: chatRoom._id,
  //       senderId: performerId,
  //       receiverId: userId,
  //       message: `Hi ${user.username}, how can I help you?`,
  //     });
  //     await performerReply.save();

  //     const populatedChatRoom = await ChatRoomModel.findById(
  //       chatRoom._id
  //     ).populate("participants");

  //     return populatedChatRoom;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  // CheckOnline = async (
  //   id: mongoose.Types.ObjectId,
  //   oId: mongoose.Types.ObjectId
  // ): Promise<boolean> => {
  //   try {
  //     const chatRoom = await ChatRoomModel.findOne({
  //       participants: { $all: [id, oId] },
  //     });

  //     if (!chatRoom) {
  //       return false;
  //     }

  //     return chatRoom.online.includes(oId);
  //   } catch (error) {
  //     console.error("Error in CheckOnline:", error);
  //     throw new Error("Unable to check online status.");
  //   }
  // };
  // offlineUser = async (
  //   userId: mongoose.Types.ObjectId
  // ): Promise<ChatRoom[] | null> => {
  //   try {
  //     const updatedRooms = await ChatRoomModel.updateMany(
  //       { participants: userId },
  //       { $pull: { online: userId } },
  //       { new: true }
  //     );
  //     console.log("up", updatedRooms);

  //     if (updatedRooms.modifiedCount > 0) {
  //       return await ChatRoomModel.find({ participants: userId });
  //     }

  //     return null;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  // onlineUser = async (
  //   uId: mongoose.Types.ObjectId,
  //   pId: mongoose.Types.ObjectId
  // ): Promise<any> => {
  //   try {
  //     const updatedRooms = await ChatRoomModel.updateMany(
  //       { participants: uId },
  //       { $pull: { online: uId } },
  //       { new: true }
  //     );

  //     const userRoom = await ChatRoomModel.findOne({
  //       participants: { $all: [uId, pId] },
  //     });

  //     if (!userRoom) {
  //       return null;
  //     }

  //     if (userRoom.online.includes(uId)) {
  //       return userRoom;
  //     }

  //     userRoom.online.push(uId);
  //     await userRoom.save();

  //     return userRoom;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // };
  // getMessageNotification = async (
  //   userId: mongoose.Types.ObjectId
  // ): Promise<MessageNotification | null> => {
  //   try {
  //     const unreadMessages = await MessageModel.aggregate([
  //       {
  //         $match: {
  //           receiverId: userId,
  //           read: false,
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$senderId",
  //           numberOfMessages: { $sum: 1 },
  //         },
  //       },
  //     ]);

  //     if (unreadMessages.length === 0) {
  //       return null;
  //     }

  //     const totalCount = unreadMessages.reduce(
  //       (sum, msg) => sum + msg.numberOfMessages,
  //       0
  //     );

  //     const notifications = unreadMessages.map((msg) => ({
  //       userId: msg._id.toString(),
  //       numberOfMessages: msg.numberOfMessages,
  //     }));

  //     return {
  //       totalCount,
  //       notifications,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching message notifications:", error);
  //     throw error;
  //   }
  // };
  // getAllChatRooms = async (
  //   userId: mongoose.Types.ObjectId
  // ): Promise<ChatRoom[] | null> => {
  //   try {
  //     const chatRooms = await ChatRoomModel.find({ participants: userId });

  //     const chatRoomsWithMessages = await Promise.all(
  //       chatRooms.map(async (chatRoom) => {
  //         const lastMessage = await MessageModel.findOne({
  //           roomId: chatRoom._id,
  //         }).sort({ timestamp: -1 });

  //         const otherParticipantId = chatRoom.participants.find(
  //           (id) => id.toString() !== userId.toString()
  //         );
  //         const otherParticipant = await UserModel.findById(otherParticipantId);

  //         const performer = await PerformerModel.findOne({
  //           userId: otherParticipantId,
  //         });

  //         return {
  //           chatRoom,
  //           lastMessageTimestamp: lastMessage
  //             ? lastMessage.timestamp
  //             : new Date(0), // Use epoch if no messages
  //           profileImage: otherParticipant?.profileImage || null, // Use user's profile image
  //           userName: otherParticipant ? otherParticipant.username : null,
  //           performerName: performer ? performer.bandName : null,
  //           otherId: otherParticipantId ? otherParticipantId.toString() : null, // Convert to string
  //         };
  //       })
  //     );

  //     // Sort chat rooms by the timestamp of their latest message (most recent first)
  //     const sortedChatRooms = chatRoomsWithMessages
  //       .sort(
  //         (a, b) =>
  //           b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()
  //       )
  //       .map((room) => ({
  //         profileImage: room.profileImage,
  //         userName: room.userName,
  //         performerName: room.performerName,
  //         otherId: room.otherId,
  //         myId: userId ? userId.toString() : null,
  //       }));

  //     return sortedChatRooms;
  //   } catch (error) {
  //     console.error("Error fetching chat rooms:", error);
  //     return null;
  //   }
  // };
  // ChatWith = async (
  //   myIdObject: mongoose.Types.ObjectId,
  //   anotherIdObject: mongoose.Types.ObjectId
  // ): Promise<any[] | null> => {
  //   try {
  //     await MessageModel.updateMany(
  //       { receiverId: myIdObject, senderId: anotherIdObject, read: false },
  //       { $set: { read: true } }
  //     );

  //     const chatMessages = await MessageModel.find({
  //       $or: [
  //         { senderId: myIdObject, receiverId: anotherIdObject },
  //         { senderId: anotherIdObject, receiverId: myIdObject },
  //       ],
  //     }).sort({ timestamp: 1 });

  //     const messagesWithRole = chatMessages.map((message) => {
  //       if (message.senderId.toString() === myIdObject.toString()) {
  //         return { ...message.toObject(), role: "sender" };
  //       } else {
  //         return { ...message.toObject(), role: "receiver" };
  //       }
  //     });

  //     return messagesWithRole;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
  // sendMessage = async (
  //   senderId: mongoose.Types.ObjectId,
  //   receiverId: mongoose.Types.ObjectId,
  //   message: string
  // ): Promise<ChatRoomDocument | null> => {
  //   try {
  //     let chatRoom = await ChatRoomModel.findOne({
  //       participants: { $all: [senderId, receiverId] },
  //     });

  //     if (!chatRoom) {
  //       chatRoom = new ChatRoomModel({
  //         participants: [senderId, receiverId],
  //       });
  //       await chatRoom.save();
  //     }

  //     const isReceiverOnline = chatRoom.online.includes(receiverId);

  //     const newMessage = new MessageModel({
  //       roomId: chatRoom._id,
  //       senderId,
  //       receiverId,
  //       message,
  //       read: isReceiverOnline,
  //     });

  //     await newMessage.save();

  //     const populatedChatRoom = await ChatRoomModel.findById(
  //       chatRoom._id
  //     ).populate("participants");

  //     return populatedChatRoom;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
}
