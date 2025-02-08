import { BookingDocument } from "../../infrastructure/models/bookingEvents";
import { EventDocument } from "../../infrastructure/models/eventsModel";
import { Performer } from "./performer";

export interface PopulatedBooking extends Omit<BookingDocument, 'eventId'> {
  eventId: EventDocument;
}
 export interface PopulatedPerformer extends Omit<Performer, 'userId'> {
    userId: {
      createdAt: Date;
     
    };
  }
  