import { SlotDocuments, SlotModel } from "../../models/slotModel";
import { PerformerDocuments, PerformerModel } from "../../models/performerModel";
import { TempPerformerDocument } from "../../models/tempPerformer";
import mongoose from "mongoose";
import { IperformerRepository } from "../../../application/interfaces/performer/repositary/performer";


import { UserDocuments, UserModel } from "../../models/userModel";

import bcrypt from "bcrypt";

import { TempPerformerModel } from "../../models/tempPerformer";

import { asPerformer } from "../../../domain/entities/asPerformer";
import { Types } from "mongoose";

import { EventDocument, EventModel } from "../../models/eventsModel";

import {BookingModel } from "../../models/bookingEvents";
import { WalletModel } from "../../models/walletHistory";
import { SlotMangement } from "../../../domain/entities/slot";
import { performerAllDetails } from "../../../domain/entities/performerAllDetails";
import { PerformerReport } from "../../../domain/entities/performerReport";

export class performerRepository implements IperformerRepository {

  getReport = async (
    performerId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<PerformerReport | null> => {
    try {
      const performer = await UserModel.findById(performerId);
      if (!performer) throw new Error("Performer not found");

      const performerDetails = await PerformerModel.findOne({
        userId: performerId,
      });
      if (!performerDetails) throw new Error("Performer details not found");

      const totalPrograms = await EventModel.countDocuments({
        userId: performerId,
      });

      const bookings = await BookingModel.find({
        performerId: performerDetails._id,
        date: { $gte: startDate, $lte: endDate },
      }).populate("eventId");

      const totalEventsHistory: Record<string, number> = {};
      const performerRegistrationHistory: Record<string, number> = {};
      const upcomingEvent: PerformerReport["upcomingEvent"] = [];
      const eventHistory: PerformerReport["eventHistory"] = [];
    console.log(totalEventsHistory);
    
      for (const booking of bookings) {
        const event = booking.eventId as unknown as EventDocument;

        if (booking.bookingStatus === "completed") {
          eventHistory.push({
            title: event.title,
            date: booking.date,
            place: booking.place,
            price: event.price,
            rating: event.rating,
            teamLeadername: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            category: event.category,
            status: booking.bookingStatus,
          });
        }

        if (booking.date > new Date()) {
          upcomingEvent.push({
            title: event.title,
            date: booking.date,
            place: booking.place,
            price: event.price,
            rating: event.rating,
            teamLeadername: event.teamLeader,
            teamLeaderNumber: event.teamLeaderNumber,
            category: event.category,
            status: booking.bookingStatus,
          });
        }

        const month = booking.date.toISOString().slice(0, 7);
        performerRegistrationHistory[month] =
          (performerRegistrationHistory[month] || 0) + 1;
      }

      return {
        totalPrograms: totalPrograms || 0,

        upcomingEvent,
        eventHistory,
      };
    } catch (error:unknown) {
      console.error("Error fetching performer details:",error);
      throw new Error(`Error fetching performer details:`);
    }
  };
  loginPerformer = async (
    email: string,
    password: string
  ): Promise<asPerformer | null | string> => {
    try {
      const performer = await UserModel.findOne({ email: email });

      if (!performer) {
        return null;
      } else if (performer.isPerformerBlocked) {
        return "Performer is Blocked";
      } else if (!performer.isVerified) {
        return "Performer is not Verified";
      }

      const isMatch = await bcrypt.compare(password, performer.password);
      if (!isMatch) {
        return null;
      }

      return {
        username: performer.username,
        email: performer.email,
        password: performer.password,
        _id: performer._id?.toString(),
        isVerified: performer.isVerified,
        isPerformerBlocked: performer.isPerformerBlocked,
      };
    } catch (error) {
      throw error;
    }
  };
  getPerformerDetails = async (
    userId: Types.ObjectId
  ): Promise<PerformerDocuments | null> => {
    try {
      const performer = await PerformerModel.findOne({ userId }).lean().exec();

      if (!performer) throw new Error("Performer not found");

      return performer;
    } catch (error) {
      console.error("Error occurred while finding performer:", error);
      return null;
    }
  };
  videoUploadDB = async (
    bandName: string,
    mobileNumber: string,
    description: string,
    user_id: mongoose.Types.ObjectId,
    s3Location: string
  ): Promise<TempPerformerDocument | null> => {
    try {
     await UserModel.findByIdAndUpdate(user_id, {
        waitingPermission: true,
      });

      const newTempPerformer = new TempPerformerModel({
        bandName: bandName,
        mobileNumber: mobileNumber,
        video: s3Location,
        description: description,
        user_id: user_id,
      });

      const savedTempPerformer = await newTempPerformer.save();

      return savedTempPerformer;
    } catch (error) {
      console.error("Error occurred while creating temp performer:", error);
      return null;
    }
  };
  getAllUsers = async (
    id: mongoose.Types.ObjectId
  ): Promise<UserDocuments[] | null> => {
    try {
      const users = await UserModel.find({ _id: { $ne: id } });
      return users;
    } catch (error) {
      throw error;
    }
  };
  performerAllDetails = async (
    id: mongoose.Types.ObjectId
  ): Promise<performerAllDetails | null> => {
    try {
      const performer = await UserModel.findById(id);
      if (!performer) throw new Error("Performer not found");

      const performerDetails = await PerformerModel.findOne({ userId: id });
      if (!performerDetails) throw new Error("Performer details not found");

      await BookingModel.find({ userId: performerDetails?._id });

      const totalEvents = await BookingModel.find({
        performerId: performerDetails._id,
      }).countDocuments();

      const userWallet = await WalletModel.find({ userId: id });

      const walletAmount = userWallet.reduce(
        (total, wallet) => total + wallet.amount,
        0
      );
      const walletTransactionHistory = userWallet.reduce(
        (history, wallet) => ({
          ...history,
          [wallet.date.toISOString()]: wallet.amount,
        }),
        {}
      );

      const totalPrograms = await EventModel.countDocuments({ userId: id });

      const upcomingEventsPipeline = [
        {
          $match: {
            performerId: performerDetails._id,
            bookingStatus: { $nin: ["canceled", "completed"] },
          },
        },
        {
          $project: {
            formattedDate: {
              $dateToString: { format: "%Y-%m", date: "$date" },
            },
            count: 1,
          },
        },
        {
          $group: {
            _id: "$formattedDate",
            count: { $sum: 1 },
          },
        },
      ];

      const upcomingEventsResult = await BookingModel.aggregate(
        upcomingEventsPipeline
      );

      const upcomingEvents = upcomingEventsResult.reduce(
        (events, item) => ({ ...events, [item._id]: item.count }),
        {}
      );

      const totalEventsHistoryPipeline = [
        {
          $match: {
            performerId: performerDetails._id,
            bookingStatus: "completed",
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%d/%m/%Y", date: "$date" } }, // Use '%Y' for the year
            count: { $sum: 1 },
          },
        },
      ];

      const totalEventsHistoryResult = await BookingModel.aggregate(
        totalEventsHistoryPipeline
      );
      const totalEventsHistory = totalEventsHistoryResult.reduce(
        (history, item) => ({ ...history, [item._id]: item.count }),
        {}
      );

      return {
        walletAmount,
        walletTransactionHistory,
        totalEvent: totalEvents,
        totalPrograms,
        totalEventsHistory,
        upcomingEvents,
        totalReviews: performerDetails.totalReviews || 0,
      };
    } catch (error: unknown) {
      console.error("Error fetching performer details:", error);

      throw new Error(`Error fetching performer details:}`);
    }
  };

 

  slotDetails = async (
    id: mongoose.Types.ObjectId
  ): Promise<SlotMangement | null> => {
    try {
      const performer = await PerformerModel.findOne({ userId: id });

      if (!performer) {
        throw new Error("Performer not found");
      }

      const performerId = performer._id;

      const performerSlot = await SlotModel.findOne({
        performerId: performerId,
      });

      const bookingEvents = await BookingModel.find({
        performerId: performerId,
        bookingStatus: { $ne: "canceled" },
      });

      const bookingDates = bookingEvents.map((event) => event.date);

      let unavailableDates: Date[] = [];

      if (performerSlot) {
        unavailableDates = performerSlot.dates.filter(
          (date) =>
            !bookingDates.some(
              (bookingDate) => bookingDate.getTime() === date.getTime()
            )
        );
      }

      const slotManagement = {
        bookingDates: bookingDates,
        unavailableDates: unavailableDates,
      } as SlotMangement;

      return slotManagement;
    } catch (error) {
      console.error("Error fetching slot details:", error);
      throw error;
    }
  };
  updateslot = async (
    id: mongoose.Types.ObjectId,
    date: Date
  ): Promise<SlotDocuments | null | string> => {
    try {
      if (!id || !date) {
        throw new Error("User ID and date are required");
      }

      const performer = await PerformerModel.findOne({ userId: id });

      if (!performer) {
        throw new Error("Performer not found");
      }

      const performerId = performer._id;

      const existingBooking = await BookingModel.findOne({
        performerId,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        bookingStatus: { $ne: "canceled" },
      });

      if (existingBooking) {
        return "Slot already booked for this date";
      }

      let slotDocument = await SlotModel.findOne({ performerId });

      if (!slotDocument) {
        slotDocument = new SlotModel({
          performerId,
          dates: [new Date(date.setHours(0, 0, 0, 0))],
        });
        return await slotDocument.save();
      }

      const normalizedDate = new Date(date.setHours(0, 0, 0, 0));

      const dateIndex = slotDocument.dates.findIndex(
        (existingDate) =>
          existingDate.toISOString().split("T")[0] ===
          normalizedDate.toISOString().split("T")[0]
      );

      if (dateIndex !== -1) {
        slotDocument.dates.splice(dateIndex, 1);
      } else {
        slotDocument.dates.push(normalizedDate);
      }

      return await slotDocument.save();
    } catch (error) {
      console.error("Error in updateSlot:", error);
      throw error;
    }
  };
}
