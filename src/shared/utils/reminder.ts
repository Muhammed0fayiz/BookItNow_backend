import { EventDocument } from './../../infrastructure/models/eventsModel';

import { BookingModel } from "../../infrastructure/models/bookingEvents";
import { UserModel, UserDocuments } from '../../infrastructure/models/userModel';
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
      }).populate(["userId", "eventId"]);
  
      if (!bookings || bookings.length === 0) {
        console.log("No reminders to send.");
        return;
      }
  
      for (const booking of bookings) {
     
        if (!("username" in booking.userId) || !("title" in booking.eventId)) {
          console.error(`Booking ${booking._id} has unpopulated references`);
          continue;
        }
  
       const user = booking.userId as unknown as UserDocuments;
             const event = booking.eventId as unknown as EventDocument;
  
        const message = `${user.username}, your event "${event.title}" is on ${booking.date.toLocaleDateString()}. Please don't miss it!`;
  
        // Send email
        await sendEmail(user.email, message);
  
        // Update booking to mark reminder as sent
        booking.reminderSend = true;
        await booking.save();
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
          user: process.env.EMAIL_ADDRESS, // Your email address
          pass: process.env.EMAIL_PASSWORD, // Your email password or app password
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



