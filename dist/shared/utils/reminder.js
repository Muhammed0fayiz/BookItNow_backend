"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReminder = void 0;
const performerModel_1 = require("./../../infrastructure/models/performerModel");
const eventsModel_1 = require("./../../infrastructure/models/eventsModel");
const bookingEvents_1 = require("../../infrastructure/models/bookingEvents");
const userModel_1 = require("../../infrastructure/models/userModel");
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendReminder = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const date = new Date();
        const futureDate = new Date(date);
        futureDate.setDate(date.getDate() + 10);
        const bookings = yield bookingEvents_1.BookingModel.find({
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
                const performerModel = yield performerModel_1.PerformerModel.findById(booking.performerId);
                if (!performerModel) {
                    console.error(`Performer model not found for booking: ${booking._id}`);
                    continue;
                }
                // Find performer user
                const performer = yield userModel_1.UserModel.findById(performerModel.userId);
                // Find user and event
                const user = yield userModel_1.UserModel.findById(booking.userId);
                const event = yield eventsModel_1.EventModel.findById(booking.eventId);
                if (!performer || !user || !event) {
                    console.error(`Missing performer, user, or event for booking: ${booking._id}`);
                    continue;
                }
                // Message for user
                const userMessage = `Hey ${user.username}, your event "${event.title}" is on ${booking.date.toLocaleDateString()}. Please don't miss it!`;
                // Message for performer
                const performerMessage = `Hey ${performer.username}, you have an upcoming event "${event.title}" on ${booking.date.toLocaleDateString()}. Don't forget to prepare!`;
                // Send emails to both user and performer
                yield Promise.all([
                    sendEmail(user.email, userMessage),
                    sendEmail(performer.email, performerMessage)
                ]);
                // Update booking to mark reminder as sent
                booking.reminderSend = true;
                yield booking.save();
            }
            catch (bookingError) {
                console.error(`Error processing booking ${booking._id}:`, bookingError);
            }
        }
        console.log("All reminders sent successfully.");
    }
    catch (error) {
        console.error("Error sending reminders:", error);
    }
});
exports.sendReminder = sendReminder;
const sendEmail = (email, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
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
        yield transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${email}`);
    }
    catch (error) {
        console.error("Error in sending email:", error);
    }
});
