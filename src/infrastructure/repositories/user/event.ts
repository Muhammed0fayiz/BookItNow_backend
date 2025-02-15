


import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { IuserEventRepository } from "../../../application/interfaces/user/repositary/event";
import {UserModel } from "../../models/userModel";
import mongoose from "mongoose";
import { EventDocument, EventModel } from "../../models/eventsModel";
import { PerformerModel } from "../../models/performerModel";
import { Performer } from "../../../domain/entities/performer";
import { BookingDocument, BookingModel } from "../../models/bookingEvents";
import { AdminModel } from "../../models/adminModel";
import {WalletModel } from "../../models/walletHistory";
import { SlotModel } from "../../models/slotModel";
import { FavoriteDocument, FavoriteModel } from "../../models/FavoriteScema";
import { RatingModel } from "../../models/ratingModel";
import { eventRating } from "../../../domain/entities/eventRating";
import { BookingForm, FilterOptions, SortOptions } from "../../../domain/entities/bookingForm";





interface PerformerDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  bandName: string;
  description: string;
  profileImage: string;
  place: string;
  rating: number;
}

// Define the combined filter type using Mongoose's FilterQuery
type CombinedFilter = mongoose.FilterQuery<PerformerDocument> & {
  userId: {
    $ne: mongoose.Types.ObjectId;
    $nin: mongoose.Types.ObjectId[];
  };
  $or?: {
    [key in 'bandName' | 'place']?: { $regex: string; $options: string };
  }[];
};

export class userEventRepository implements IuserEventRepository {
  getEvent=async(eventId: mongoose.Types.ObjectId): Promise<EventDocument | null>=> {
   try {
     return EventModel.findById(eventId)
   } catch (error) {
    throw error
   }
  }
  getPerformerEvents = async (id: mongoose.Types.ObjectId): Promise<EventDocument[] | null> => {
    try {
      const events = await EventModel.find({
        userId: id,
        isperformerblockedevents: false,
        isblocked: false
      });
      return events;
    } catch (error) {
      throw error;
    }
  };
  
 getPerformer = async (id: mongoose.Types.ObjectId): Promise<Performer| null> => {
    return await PerformerModel.findOne({ userId: id });
  };
  
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
   formData: BookingForm,
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

    const slotDocument = await SlotModel.findOne({
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
    formData: BookingForm,
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
      const slotDocument = await SlotModel.findOne({
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

     await AdminModel.updateOne(
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
       filterOptions: Partial<{ category: string; title: { $regex: string; $options: string } }>,
       sortOptions: Record<string, 1 | -1>,
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
          console.log('bddfasdfafdsdas',booking);
          
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
  filterOptions: FilterOptions,
  sortOptions: SortOptions = { rating: -1 },
  skip: number,
  limit: number
): Promise<{ performers: Performer[]; totalCount: number } | null> => {
  try {
    const userId = typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;

    console.log('repo', filterOptions, sortOptions);

    const blockedUsers = await UserModel.find(
      { isPerformerBlocked: true },
      { _id: 1 }
    );
    const blockedUserIds = blockedUsers.map((user) => user._id);

    const combinedFilter: CombinedFilter = {
      userId: {
        $ne: userId,
        $nin: blockedUserIds as mongoose.Types.ObjectId[],
      },
    };

    if (filterOptions) {
      if (filterOptions.search) {
        const searchStr = filterOptions.search.trim();
        combinedFilter.$or = [
          { bandName: { $regex: searchStr, $options: "i" } },
          { place: { $regex: searchStr, $options: "i" } },
        ];
      } else if (filterOptions.$or) {
        combinedFilter.$or = filterOptions.$or;
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
    formData: BookingForm,
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



}
