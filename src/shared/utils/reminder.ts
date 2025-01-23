import { PerformerModel } from './../../infrastructure/models/performerModel';
import { EventModel } from './../../infrastructure/models/eventsModel';
import { BookingModel } from "../../infrastructure/models/bookingEvents";
import { UserModel } from '../../infrastructure/models/userModel';
import nodemailer from "nodemailer";

export const sendReminder = async (): Promise<void> => {
    try {
      const date = new Date();
      const futureDate = new Date(date);
      futureDate.setDate(date.getDate() + 10); 
  
      const bookings = await BookingModel.find({
        date: { $gte: date, $lt: futureDate }, 
        reminderSend: false,
        bookingStatus: { $ne: "canceled" },
      });
  
      if (!bookings || bookings.length === 0) {
        console.log("No reminders to send.");
        return;
      }
  
      for (const booking of bookings) {
        try {
          // Find performer model first
          const performerModel = await PerformerModel.findById(booking.performerId);
          
          if (!performerModel) {
            console.error(`Performer model not found for booking: ${booking._id}`);
            continue;
          }

          // Find performer user
          const performer = await UserModel.findById(performerModel.userId);

          // Find user and event
          const user = await UserModel.findById(booking.userId);
          const event = await EventModel.findById(booking.eventId);
  
          if (!performer || !user || !event) {
            console.error(`Missing performer, user, or event for booking: ${booking._id}`);
            continue;
          }
    
          // Message for user
          const userMessage = `Hey ${user.username}, your event "${event.title}" is on ${booking.date.toLocaleDateString()}. Please don't miss it!`;
          
          // Message for performer
          const performerMessage = `Hey ${performer.username}, you have an upcoming event "${event.title}" on ${booking.date.toLocaleDateString()}. Don't forget to prepare!`;
    
          // Send emails to both user and performer
          await Promise.all([
            sendEmail(user.email, userMessage),
            sendEmail(performer.email, performerMessage)
          ]);
    
          // Update booking to mark reminder as sent
          booking.reminderSend = true;
          await booking.save();
        } catch (bookingError) {
          console.error(`Error processing booking ${booking._id}:`, bookingError);
        }
      }
  
      console.log("All reminders sent successfully.");
    } catch (error) {
      console.error("Error sending reminders:", error);
    }
  };
  
  const sendEmail = async (email: string, message: string): Promise<void> => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "Event Reminder",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <p>Dear User,</p>
            <p>${message}</p>
            <p>We hope to see you there!</p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${email}`);
    } catch (error) {
      console.error("Error in sending email:", error);
    }
  };