import { UpcomingEventDocument } from "../../../../domain/entities/upcomingevent";
import mongoose from "mongoose";
import { EventDocument } from "../../../../infrastructure/models/eventsModel";
import { Performer } from "../../../../domain/entities/performer";
import { BookingDocument } from "../../../../infrastructure/models/bookingEvents";
import { FavoriteDocument } from "../../../../infrastructure/models/FavoriteScema";

import { eventRating } from "../../../../domain/entities/eventRating";
import { BookingForm, FilterOptions, SortOptions } from "../../../../domain/entities/bookingForm";


export interface IuserEventRepository {

  

 

 
  getAllEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[] | null>;
  userBookEvent(
  formData: BookingForm,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;
  getAllUpcomingEvents(
    id: mongoose.Types.ObjectId
  ): Promise<{ totalCount: number; upcomingEvents: UpcomingEventDocument[] }>;
  cancelEvent(
    objectId: mongoose.Types.ObjectId
  ): Promise<BookingDocument | null>;
  getAllEventHistory(id: mongoose.Types.ObjectId): Promise<{
    totalCount: number;
    pastEventHistory: UpcomingEventDocument[];
  }>;
  getEventHistory(
    userId: mongoose.Types.ObjectId,
    page: number
  ): Promise<{
    pastEventHistory: UpcomingEventDocument[];
  }>;
  getFilteredEvents(
   id: mongoose.Types.ObjectId,
      filterOptions: Partial<{ category: string; title: { $regex: string; $options: string } }>,
      sortOptions: Record<string, 1 | -1>,
      skip: number,
      limit: number
  ): Promise<{ events: EventDocument[]; totalCount: number } | null>;
  ratingAdded(
    bookingId: mongoose.Types.ObjectId,
    rating: number,
    review: string
  ): Promise<EventDocument | null>;
    getEventRating(eventId:mongoose.Types.ObjectId):Promise<eventRating[]|null>
  userWalletBookEvent(
    formData: BookingForm,
    eventId: string,
    performerId: string,
    userId: string
  ): Promise<BookingDocument | null>;
  toggleFavoriteEvent(
    uid: mongoose.Types.ObjectId,
    eid: mongoose.Types.ObjectId
  ): Promise<FavoriteDocument | null>;
  getFilteredPerformers(
 id:mongoose.Types.ObjectId,
  filterOptions: FilterOptions,
    sortOptions: SortOptions,
    skip: number,
    limit: number
  ): Promise<{ performers: Performer[]; totalCount: number } | null>;
favaroiteEvents(id: mongoose.Types.ObjectId): Promise<{ totalEvent: number; events: EventDocument[] | null }>;
getUpcomingEvents(
  userId: mongoose.Types.ObjectId,
  page: number
): Promise<UpcomingEventDocument[]>;



  getAllPerformer(id: mongoose.Types.ObjectId): Promise<Performer[] | null>;
  availableDate(
    formData: BookingForm,
    eventId: string,
    performerId: string
  ): Promise<boolean>;

  getTopRatedEvent(userId:mongoose.Types.ObjectId):Promise<EventDocument[]|null >
  getPerformer(id: mongoose.Types.ObjectId): Promise<Performer| null>;
    getPerformerEvents(id: mongoose.Types.ObjectId): Promise<EventDocument[]| null>;
      getEvent(eventId: mongoose.Types.ObjectId): Promise<EventDocument| null>;
}
