import { IuserEventRepository } from './../../interfaces/user/repositary/event';
import { UpcomingEventDocument } from "../../../domain/entities/upcomingevent";
import { IuserEventUseCase } from "../../interfaces/user/useCase/event";
import mongoose from "mongoose";
import { EventDocument } from "../../../infrastructure/models/eventsModel";
import { Performer } from "../../../domain/entities/performer";
import { BookingDocument } from "../../../infrastructure/models/bookingEvents";
import { FavoriteDocument } from "../../../infrastructure/models/FavoriteScema";
import { eventRating } from "../../../domain/entities/eventRating";
import { BookingForm, FilterOptions, SortOptions } from '../../../domain/entities/bookingForm';
export class userEventUseCase implements IuserEventUseCase {
  private _repository:  IuserEventRepository;

  constructor(private repository:  IuserEventRepository) {
    this._repository = repository;
  }
  getEvent=async(eventId: mongoose.Types.ObjectId): Promise<EventDocument | null> =>{
   try {
    return this._repository.getEvent(eventId)
   } catch (error) {
    throw error
   }
  }
  getPerformerEvents=async(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>=> {
   try {
    return await this._repository.getPerformerEvents(id)
   } catch (error) {
    throw error
    
   }
  }
  getPerformer=async(id: mongoose.Types.ObjectId): Promise<Performer | null>=> {
    return await this._repository.getPerformer(id)
  }
  getTopRatedEvent=async(userId:mongoose.Types.ObjectId): Promise<EventDocument[] | null>=>{
   try {

    const ratedEvent=await this._repository.getTopRatedEvent(userId)


    
     return ratedEvent
   } catch (error) {
    throw error
   }
  }

 

 

  getAllEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<EventDocument[] | null> => {
    try {
      return this._repository.getAllEvents(id);
    } catch (error) {
      throw error;
    }
  };
  toggleFavoriteEvent = async (
    uid: mongoose.Types.ObjectId,
    eid: mongoose.Types.ObjectId
  ): Promise<FavoriteDocument | null> => {
    try {
      return this._repository.toggleFavoriteEvent(uid, eid);
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
      return this._repository.ratingAdded(bookingId, rating, review);
    } catch (error) {
      throw error;
    }
  };
  getEventRating=async(eventId: mongoose.Types.ObjectId): Promise<eventRating[] | null>=> {
    try {
     return this._repository.getEventRating(eventId)
    } catch (error) {
     throw error
    }
   }
  userBookEvent = async (
    formData: BookingForm,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null> => {
    try {
      const bookEvent = this._repository.userBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );
      return bookEvent;
    } catch (error) {
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
      const walletbooking = this._repository.userWalletBookEvent(
        formData,
        eventId,
        performerId,
        userId
      );
      return walletbooking;
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
      const result = await this._repository.getAllUpcomingEvents(id);
      return {
        totalCount: result.totalCount,
        upcomingEvents: result.upcomingEvents,
      };
    } catch (error) {
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
      const result = await this._repository.getAllEventHistory(id);
      return {
        totalCount: result.totalCount,
        pastEventHistory: result.pastEventHistory,
      };
    } catch (error) {
      throw error;
    }
  };
  getEventHistory = async (
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<{
    pastEventHistory: UpcomingEventDocument[];
  }> => {
    try {
      // Make sure you're calling the correct method, not the one that leads to recursion.
      const response = await this._repository.getEventHistory(userId, page); // <-- Call the correct method

      return response; // Return the response correctly
    } catch (error) {
      console.error("Error in getEventHistory usecase:", error);
      throw error; // Propagate the error to be handled by the caller
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
      const filteredEvents = await this._repository.getFilteredEvents(
        id,
        filterOptions,
        sortOptions,
        skip,
        limit
      );
      return filteredEvents;
    } catch (error) {
      throw error;
    }
  };
  favaroiteEvents = async (
    id: mongoose.Types.ObjectId
  ): Promise<{ totalEvent: number; events: EventDocument[] | null }> => {
    try {
      return this._repository.favaroiteEvents(id);
    } catch (error) {
      throw error;
    }
  };
  getUpcomingEvents = async (
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<UpcomingEventDocument[]> => {
    try {
      const response = await this._repository.getUpcomingEvents(userId, page);

      return response;
    } catch (error) {
      console.error("Error in getUpcomingEvents usecase:", error);
      throw error;
    }
  };
  cancelEvent = async (
    id: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null> => {
    try {
      return await this._repository.cancelEvent(id);
    } catch (error) {
      throw error;
    }
  };

  getFilteredPerformers = async (
    id: mongoose.Types.ObjectId,
   filterOptions: FilterOptions,
     sortOptions: SortOptions,
    skip: number,
    limit: number
  ): Promise<{ performers: Performer[]; totalCount: number } | null> => {
    try {
      const filteredPerformers = await this._repository.getFilteredPerformers(
        id,
        filterOptions,
        sortOptions,
        skip,
        limit
      );
      return filteredPerformers;
    } catch (error) {
      throw error;
    }
  };
  availableDate(
    formData: BookingForm,
    eventId: string,
    performerId: string
  ): Promise<boolean> {
    try {
      const bookEvent = this._repository.availableDate(
        formData,
        eventId,
        performerId
      );
      return bookEvent;
    } catch (error) {
      throw error;
    }
  }
  getAllPerformer = async (
    id: mongoose.Types.ObjectId
  ): Promise<Performer[] | null> => {
    try {
      return await this._repository.getAllPerformer(id);
    } catch (error) {
      throw error;
    }
  };

  
}
