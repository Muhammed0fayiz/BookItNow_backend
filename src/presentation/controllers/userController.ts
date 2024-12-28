import { Response, Request, NextFunction } from "express";
import { isValidEmail } from "../../shared/utils/validEmail";
import { ResponseStatus } from "../../constants/responseStatus";
import { IuserUseCase } from "../../application/interfaces/IuserUseCase";
import { User } from "../../domain/entities/user";
import { isValidPassword } from "../../shared/utils/validPassword";
import { isValidFullName } from "../../shared/utils/validName";
import { generateOTP } from "../../shared/utils/generateOtp";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../infrastructure/models/tempPerformer";
import mongoose, { Types } from "mongoose";

import {
  UserDocuments,
  UserModel,
} from "../../infrastructure/models/userModel";

import { BookingModel } from "../../infrastructure/models/bookingEvents";

export class UserController {
  private _useCase: IuserUseCase;

  constructor(private useCase: IuserUseCase) {
    this._useCase = useCase;
  }

  getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const id = req.params.id;

      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Invalid user ID format" });
      }

      const objectId = new mongoose.Types.ObjectId(id); 

      const response = await this._useCase.getUserDetails(objectId);
      if (response) {
        return res
          .status(ResponseStatus.Accepted)
          .json({ message: "User Details Fetched Successfully", response });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "User Details Fetch Failed" });
      }
    } catch (error) {
      next(error);
    }
  };

  userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
   
      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "No User Data Provided" });
      }

      const user = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
      };

      if (!user.password || !user.email) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "password or email is required" });
      }
      if (!isValidEmail(user.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Invalid email format" });
      }

      const loginUser = await this._useCase.loginUser(
        user.email,
        user.password
      );

      if (loginUser) {
        if (typeof loginUser === "string") {
          return res
            .status(ResponseStatus.Forbidden)
            .json({ message: loginUser });
        }

        //pass vand email check
        const token = await this._useCase.jwt(loginUser as User);
    
        res.status(ResponseStatus.Accepted).json({ token: token });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error);
    }
  };
  userSignup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "No User Data Provided" });
      }

      const user = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
        username: req.body.fullName,
      };

      if (!user.password || !user.email || !user.username) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "fullname,email and password is required" });
      }
      if (!isValidEmail(user.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Invalid email format" });
      }
      if (!isValidPassword(user.password)) {
        return res.status(ResponseStatus.BadRequest).json({
          message:
            "Password must include at least 1 uppercase letter, 1 number, and be at least 5 characters long.",
        });
      }
      const tempMailExist = await this.useCase.tempUserExist(user.email);

      if (tempMailExist) {
        return res
          .status(401)
          .json({ message: "OTP already sent. Please wait 15 minutes." });
      }

      const mailExist = await this._useCase.userExist(user.email);
      if (mailExist) {
        return res.status(401).json({ message: "email already exist" });
      }

      if (!isValidFullName(user.username)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Full name must be at least 3 characters long." });
      }

      const hashedPassword = await this._useCase.bcrypt(user.password);
      user.password = hashedPassword;

      const otp = generateOTP();
      const tempUser = await this._useCase.otpUser(
        user.email,
        otp,
        user.password,
        user.username
      );
      if (tempUser) {
        console.log("otp", otp);
        return res
          .status(ResponseStatus.Created)
          .json({ message: "otp generate", tempUser });
      }
      return res
        .status(ResponseStatus.BadRequest)
        .json({ message: "user not created" });
    } catch (error) {
      next(error);
    }
  };

  checkOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = {
        email: req.body.email,
        otp: req.body.otp,
      };

      const otpCheck = await this._useCase.checkOtp(user);

      if (otpCheck === null) {
        console.log("Null result: OTP check failed.");
        return res.status(400).json({ message: "Invalid OTP." });
      }

      res.status(200).json({ message: "OTP verified successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
    
      const email = req.params.email;
    
      if (email) {
        const otp = generateOTP();
        const otpUser = await this._useCase.resendOtp(email, otp);

        res.status(200).json({ message: "resend otp successfull" });
      }
    } catch (error) {
      res.status(500).json({ message: "internal server error" });
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
console.log('fahfaldsffasdljalsdfjldskf')
      const id = new mongoose.Types.ObjectId(req.params.id);
      const { currentPassword, newPassword } = req.body;

      // Check if any of the required fields are missing
      if (!id || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Perform the password change
      const changedPassword = await this._useCase.changePassword(
        id,
        currentPassword,
        newPassword
      );

      // Send the success response
      return res.status(200).json({ success: true, user: changedPassword });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Old password is incorrect") {
          return res.status(400).json({ message: error.message });
        }
        return res
          .status(500)
          .json({ message: "An error occurred", error: error.message });
      }
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  };

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
 

      if (req.user) {
        let user = req.user;
        const token = await this._useCase.jwt(user as User);
        const userData = encodeURIComponent(JSON.stringify(req.user));
        const tokenData = encodeURIComponent(JSON.stringify(token));
   
   

        res.cookie("userToken", tokenData, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.redirect(`http://localhost:3000/auth`);
      } else {
        res.redirect("http://localhost:3000/auth");
      }
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.redirect("http://localhost:3000/error");
    }
  }

  updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('fayiz')
      const { username } = req.body;
 
      const userId = new mongoose.Types.ObjectId(req.params.id);
 
      const image = req.file ? `/uploads/${req.file.filename}` : null;

   

      const updateData: { username: string; profileImage?: string | null } = {
        username,
      };

      if (image) {
        updateData.profileImage = image;
      }

      const updatedUser = (await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      )) as UserDocuments;

      if (updatedUser) {
        res
          .status(200)
          .json({ message: "Profile updated successfully", updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      // Type guard to check if the error is an instance of Error
      if (error instanceof Error) {
        res
          .status(500)
          .json({ message: "Error updating profile", error: error.message });
      } else {
        // Fallback for unknown error types
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  };

  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const allEvents = await this._useCase.getAllEvents(id);

      if (!allEvents || allEvents.length === 0) {
        // No events found
        return res.status(204).json(null);
      }

      res.status(200).json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      next(error); // Pass the error to the next middleware
    }
  };
  getAllPerformers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

    
      const id = new mongoose.Types.ObjectId(req.params.id);
      const performers = await this._useCase.getAllPerformer(id);
  


      if (!performers || performers.length === 0) {
        return res.status(404).json({ message: "No performers found." });
      }


      res.status(200).json({ success: true, data: performers });
    } catch (error) {
      console.error("Error fetching performers:", error);
      next(error); // Pass the error to the error handling middleware
    }
  };
  chatWith = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { myId, anotherId } = req.params;

    
      const myIdObject = new mongoose.Types.ObjectId(myId);
      const anotherIdObject = new mongoose.Types.ObjectId(anotherId);
  
   
      const chatting = await this._useCase.ChatWith(myIdObject, anotherIdObject);

      res.status(200).json({ message: 'Chat data fetched successfully', data: chatting });
    } catch (error) {
      // Handle errors
      console.error(error);
      next(error);
    }
  }
  // chatWithPerformer = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userid, performerid } = req.params;
//     const userId = new mongoose.Types.ObjectId(userid);
//     const performerId = new mongoose.Types.ObjectId(performerid);

//     const performerMessage = await this._useCase.chatWithPerformer(userId, performerId);

//     res.status(200).json({
//       success: true,
//       message: 'Chat started successfully',
//       data: performerMessage,
//     });
//   } catch (error) {
//     console.error('Error in chatWithPerformer:', error);
//     next(error);
//   }
// };
  bookEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { formData, eventId, performerId, userId } = req.body;
     
  
      if (!formData || typeof formData !== 'object') {
        return res.status(400).json({ error: 'Invalid form data' });
      }
      if (!eventId || typeof eventId !== 'string') {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
      if (!performerId || typeof performerId !== 'string') {
        return res.status(400).json({ error: 'Invalid performer ID' });
      }
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const bookingResult = await this._useCase.userBookEvent(formData, eventId, performerId, userId);


      console.log('booking result',bookingResult,'boo')
      
      res.status(200).json({ message: 'Event booked successfully', data: bookingResult });
    } catch (error) {
      console.error('Error booking event:', error);
      next(error);
    }
  };
  upcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format.' });
      }
  
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const upcomingEvents = await this._useCase.getAllUpcomingEvents(userObjectId);
  console.log(upcomingEvents.totalCount,'dd')
      if (upcomingEvents?.upcomingEvents?.length > 0) {
        return res.status(200).json({ 
          success: true, 
          totalCount: upcomingEvents.totalCount, 
          events: upcomingEvents.upcomingEvents 
        });
      }
  
      return res.status(404).json({ success: false, message: 'No upcoming events found.' });
    } catch (error) {
      next(error);
    }
  };
  

  cancelEventByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
   
  
        const id = req.params.id;
        const eventObjectId = new mongoose.Types.ObjectId(id); 
        if (!eventObjectId) {
            return res.status(400).json({
                success: false,
                message: "Event ID is required."
            });
        }

        const canceledEvent = await this._useCase.cancelEvent(eventObjectId);

        if (canceledEvent) {
            return res.status(200).json({
                success: true,
                message: "Event canceled successfully.",
                data: canceledEvent
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Event not found or could not be canceled."
            });
        }
    } catch (error) {
        return next(error);
    }
};
walletHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    
    const walletHistory = await this._useCase.walletHistory(objectId);
    res.status(200).json({ success: true, data: walletHistory }); 
  } catch (error) {
    next(error); 
  }
};
sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const { sender, receiver } = req.params;
    console.log('fayiz',sender,receiver)


    const senderId = new mongoose.Types.ObjectId(sender);
    const receiverId = new mongoose.Types.ObjectId(receiver);

    const { message } = req.body;


    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

  
    const sentMessage = await this._useCase.sendMessage(senderId, receiverId, message);
    const messageData = { senderId, receiverId, message }

    // const io = req.io
    // io.emit('sendMessage',messageData)
    // console.log("sending...");
    
    

    return res.status(200).json({ message: 'Message sent successfully', data: sentMessage });

  } catch (error) {
    console.error('Error in sendMessage:', error);
    next(error);
  }
};

availableDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formData, eventId, performerId } = req.body;
          console.log(formData,'is',eventId,'is',performerId)
    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({ error: 'Invalid form data' });
    }
    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    if (!performerId || typeof performerId !== 'string') {
      return res.status(400).json({ error: 'Invalid performer ID' });
    }
  

    const availableDates = await this._useCase.availableDate(formData, eventId, performerId);



    res.status(200).json({ message: 'Available dates retrieved successfully', data: availableDates });
  } catch (error) {
    console.error('Error retrieving available dates:', error);
    next(error);
  }
};
// eventHistory = async (req: Request, res: Response, next: NextFunction) => {
//   try {
  
//     const userId = req.params.id;
//     const userObjectId = new mongoose.Types.ObjectId(userId); 
    
//     const eventHistory = await this._useCase.getAlleventHistory(userObjectId);
   
//     if (eventHistory) {
   
//       return res.status(200).json({ success: true, events: eventHistory });
//     }

//     return res.status(404).json({ success: false, message: 'No upcoming events found.' });
//   } catch (error) {
//     next(error);
//   }
// };
updateBookingDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id; 
    const newDate = new Date('2024-12-01'); 
    const newStatus = "completed"; 

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      { date: newDate, bookingStatus: newStatus },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({
      message: 'Booking date and status updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

addRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const eventId = new mongoose.Types.ObjectId(id);
    const { rating, review } = req.body;

    // Validate rating
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    // Validate review
    if (!review || typeof review !== "string" || review.trim().length < 5 || review.length > 500) {
      return res.status(400).json({
        error: "Review must be a string between 5 and 500 characters",
      });
    }

    const eventRated = await this._useCase.ratingAdded(eventId, rating, review);

    if (!eventRated) {
      return res.status(404).json({ error: "Event not found or rating could not be added" });
    }

    res.status(200).json({ message: "Rating added successfully", data: eventRated });
  } catch (error) {
    next(error);
  }
};


walletPayment=async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formData, eventId, performerId, userId } = req.body;

  
    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({ error: 'Invalid form data' });
    }
    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    if (!performerId || typeof performerId !== 'string') {
      return res.status(400).json({ error: 'Invalid performer ID' });
    }
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const userWalletBookEvent = await this._useCase.userWalletBookEvent(formData, eventId, performerId, userId);



    
    res.status(200).json({ message: 'Event booked successfully', data: userWalletBookEvent });
  } catch (error) {
    console.error('Error booking event:', error);
    next(error);
  }
};



getFavoriteEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const id = new mongoose.Types.ObjectId(userId);

    const favoriteEvent = await this._useCase.favaroiteEvents(id);
     console.log('favo',favoriteEvent)

    return res.status(200).json({
      success: true,
      data: favoriteEvent,
    });
  } catch (error) {
    next(error); 
  }
};

toggleFavoriteEvent= async (req: Request, res: Response, next: NextFunction) => {
  try {

    const userId = req.params.userId; 
    const eventId = req.params.eventId; 
    console.log('fayivaifadkfajdsladjsfads',userId,eventId)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid user or event ID" });
    }
    const uid = new mongoose.Types.ObjectId(userId);
    const eid = new mongoose.Types.ObjectId(eventId);

    const result = await this._useCase.toggleFavoriteEvent(uid, eid);

   
    return res.status(200).json({ message: "Event added to favorites", data: result });
  } catch (error) {
   
    next(error);
  }
};
 getAllChatRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    const id = req.params.id;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const userId = new mongoose.Types.ObjectId(id);


    const allRooms = await this._useCase.getAllChatRooms(userId);
  console.log('allrooms',allRooms)

    return res.status(200).json({ success: true, data: allRooms });
  } catch (error) {
  
    next(error);
  }
};

 getUpcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {

    console.log('ucountrre')
    const id = req.params.id;
    const userId = new mongoose.Types.ObjectId(id); 
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

    const upcomingEvents = await this._useCase.getUpcomingEvents(userId, page);

   return res.json({ events: upcomingEvents || [] });
  } catch (error) {
    next(error); 
  }
};

eventHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    const userId = req.params.id;
    const userObjectId = new mongoose.Types.ObjectId(userId); 
    
    const eventHistory = await this._useCase.getAllEventHistory(userObjectId);
   console.log('event',eventHistory)
  
    if (eventHistory?.pastEventHistory?.length > 0) {
      return res.status(200).json({ 
        success: true, 
        totalCount: eventHistory.totalCount, 
        events: eventHistory.pastEventHistory 
      });
    }

    return res.status(404).json({ success: false, message: 'No upcoming events found.' });
  } catch (error) {
    next(error);
  }
};



getEventHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {


    const id = req.params.id;
    const userId = new mongoose.Types.ObjectId(id); 
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

    const getEventHistory = await this._useCase.getEventHistory(userId, page);
    console.log('fay',getEventHistory)

   return res.json({ events: getEventHistory || [] });
  } catch (error) {
    next(error); 
  }
};

}
