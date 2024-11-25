
import { loginpefomer } from './../../../../frontend/src/datas/logindatas';
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
import { IperformerUseCase } from "../../application/interfaces/IperformerUseCase";
import { asPerformer } from "../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { PerformerDocuments, PerformerModel } from '../../infrastructure/models/performerModel';
import { EventDocument } from '../../infrastructure/models/eventsModel';

export class performerController {
  private _useCase: IperformerUseCase;
   

  constructor(private useCase: IperformerUseCase) {
    this._useCase = useCase;
  }

 
  addTempPerformer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log(req.body, "body is tempok");
      console.log(req.file, "file one");
      const { bandName, mobileNumber, description, user_id } = req.body;

const video = req.file;
const response  = await this._useCase.videoUpload(bandName,mobileNumber,description,user_id,video);
if(response){

  return res.status(ResponseStatus.Accepted).json({ response });
}


    } catch (error) {
      next(error);
    }
  };


  performerLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "No Performer Data Provided" });
      }
  
      const performer = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
      };
  
      if (!performer.password || !performer.email) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Password or email is required" });
      }
  
      if (!isValidEmail(performer.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Invalid email format" });
      }
  
      const loginPerformer = await this._useCase.loginPerformer(
        performer.email,
        performer.password
      );
  
      if (loginPerformer) {
        if(typeof loginPerformer==='string'){
          return res.status(ResponseStatus.Forbidden).json({ message: loginpefomer });
        }
        const token = await this._useCase.jwt(loginPerformer as  asPerformer);
        res.status(ResponseStatus.Accepted).json({ token: token });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Performer not found or blocked/unverified" });
      }
    } catch (error) {
      console.log(error);
    }
  };


  getPerformerDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id = req.params.id;

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(ResponseStatus.BadRequest)
                .json({ message: "Invalid user ID format" });
        }

        const objectId = new mongoose.Types.ObjectId(id); // Convert to ObjectId

        // Fetch performer details using userId
        const response = await this._useCase.getPerformerDetails(objectId);
         
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
        next(error); // Pass the error to the next middleware
    }
};


updatePerformerProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('hello');
    const id = req.params.id;
    console.log('hello', id);
    const { bandName, mobileNumber, place } = req.body;
    console.log(req.body, 'id');

    // Handle profile image update
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    console.log('Updating user profile:', image);

    const updateData: { 
      bandName?: string; 
      mobileNumber?: string; 
      place?: string; 
      profileImage?: string | null 
    } = {};

    // Only add properties if they're provided
    if (bandName) updateData.bandName = bandName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (place) updateData.place = place;
    if (image) updateData.profileImage = image;

    // Perform the update operation
    const updatedPerformer = await PerformerModel.updateOne(
      { userId: id },
      { $set: updateData }
    );

    console.log(updatedPerformer, 'id');
    if (updatedPerformer.modifiedCount > 0) {
      res.status(200).json({ message: 'Profile updated successfully', updatedPerformer });
    } else {
      res.status(404).json({ message: 'User not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error instanceof Error) {
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};


uploadEvents = async (req: Request, res: Response, next: NextFunction): Promise<Response<any> | void> => {
  try {
    const id = req.params.id

    if (!req.body) {
      return res.status(400).json({ message: "No event data provided." });
    }

    const event = {
      imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : null,
      title: req.body.title ? req.body.title.trim() : null,
      category: req.body.category ? req.body.category.trim() : null,
      userId: new Types.ObjectId(id), // Convert userId to ObjectId
      price: req.body.price ? parseFloat(req.body.price) : null, // Convert price to number
      teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : null,
      teamLeaderNumber: req.body.teamLeaderNumber ? parseInt(req.body.teamLeaderNumber, 10) : null, // Convert teamLeaderNumber to number
      description: req.body.description ? req.body.description.trim() : null,
    };

    // Check for required fields
    if (!event.imageUrl || !event.title || !event.category || !event.userId || !event.price || !event.teamLeader || !event.teamLeaderNumber || !event.description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Basic validation checks
    if (event.title.length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters long." });
    }
    if (isNaN(event.price)) {
      return res.status(400).json({ message: "Price must be a valid number." });
    }
    if (!/^\d{10}$/.test(event.teamLeaderNumber.toString())) {
      return res.status(400).json({ message: "Team leader number must be a valid 10-digit number." });
    }
    if (event.description.length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters long." });
    }

    // Upload event details
    const uploadedEvent = await this._useCase.uploadEvents(event);
    if (uploadedEvent) {
      return res.status(201).json({ message: "Event uploaded successfully", event: uploadedEvent });
    } else {
      return res.status(400).json({ message: "Failed to upload event." });
    }
  } catch (error) {
    next(error);
  }
};


getPerformerEvents = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id;
    console.log('Request received for performer events');
    
    const events = await this._useCase.getPerformerEvents(id);

    console.log('Retrieved events:', events);
    res.status(200).json(events);
    return events;
  } catch (error) {
    next(error);
    return null;
  }
};

deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    
    if (!id) {
      res.status(400).json({ message: 'Event ID is required' });
      return 
    }

    const deletedEvent = await this._useCase.deleteEvent(id);

    if (deletedEvent) {
      res.status(200).json({ message: 'Event deleted successfully' });
      return
    } else {
     res.status(404).json({ message: 'Event not found' });
     return 
    }

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error' });
    return
  }
};



editEvents = async (req: Request, res: Response, next: NextFunction): Promise<Response<any> | void> => {
  try {
    const userId = req.params.id;
    const eventId = req.params.eid;

    if (!req.body) {
      return res.status(400).json({ message: "No event data provided." });
    }

    const event: {
      imageUrl?: string;
      title: string;
      category: string;
      userId: Types.ObjectId;
      price: number;
      teamLeader: string;
      teamLeaderNumber: number;
      description: string;
    } = {
      imageUrl: req.body.imageUrl ? req.body.imageUrl.trim() : undefined,
      title: req.body.title ? req.body.title.trim() : "",
      category: req.body.category ? req.body.category.trim() : "",
      userId: new Types.ObjectId(userId),
      price: req.body.price ? parseFloat(req.body.price) : 0,
      teamLeader: req.body.teamLeader ? req.body.teamLeader.trim() : "",
      teamLeaderNumber: req.body.teamLeaderNumber ? parseInt(req.body.teamLeaderNumber, 10) : 0,
      description: req.body.description ? req.body.description.trim() : "",
    };

    // Check for required fields that must have non-empty values
    if (!event.title || !event.category || !event.price || !event.teamLeader || !event.teamLeaderNumber || !event.description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Call the use case with eventId and eventData
    const updatedEvent = await this._useCase.editEvents(eventId, event);
    if (updatedEvent) {
      return res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } else {
      return res.status(404).json({ message: "Event not found." });
    }
  } catch (error) {
    next(error);
  }
};


toggleBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
  try { 
    console.log('manu varma')
    const { id } = req.params;

    // Validate id
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing ID parameter' });
    }

    const changedEvent = await this._useCase.toggleBlockStatus(id);
console.log('changed',changedEvent,'change event')
    // If the toggle operation did not affect any records
    if (!changedEvent) {
      return res.status(404).json({ message: 'Event not found or update failed' });
    }

    // Success response
    res.status(200).json({
      message: 'Block status toggled successfully',
      data: changedEvent,
    });
  } catch (error) {
    // Error handling
    console.error('Error toggling block status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
}