
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
const ExcelJS = require('exceljs');
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

    const id = req.params.id;

    const { bandName, mobileNumber, place } = req.body;


   
    const image = req.file ? `/uploads/${req.file.filename}` : null;

  

    const updateData: { 
      bandName?: string; 
      mobileNumber?: string; 
      place?: string; 
      profileImage?: string | null 
    } = {};

    if (bandName) updateData.bandName = bandName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (place) updateData.place = place;
    if (image) updateData.profileImage = image;

    // Perform the update operation
    const updatedPerformer = await PerformerModel.updateOne(
      { userId: id },
      { $set: updateData }
    );


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
    console.log(id,'id')
    console.log('req',req.body)

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
     console.log('eve',event)
 
    if (!event.imageUrl || !event.title || !event.category || !event.userId || !event.price || !event.teamLeader || !event.teamLeaderNumber || !event.description) {
      return res.status(400).json({ message: "All fields are required." });
    }


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

    
    const events = await this._useCase.getPerformerEvents(id);


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


    if (!event.title || !event.category || !event.price || !event.teamLeader || !event.teamLeaderNumber || !event.description) {
      return res.status(400).json({ message: "All fields are required." });
    }


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

    const { id } = req.params;

    // Validate id
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing ID parameter' });
    }

    const changedEvent = await this._useCase.toggleBlockStatus(id);

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
// upcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
//   try {
    
//     const userId = req.params.id;
//     const userObjectId = new mongoose.Types.ObjectId(userId); 
    
//     const upcomingEvents = await this._useCase.getAllUpcomingEvents(userObjectId);

//     if (upcomingEvents) {
//       return res.status(200).json({ success: true, events: upcomingEvents });
//     }

//     return res.status(404).json({ success: false, message: 'No upcoming events found.' });
//   } catch (error) {
//     next(error);
//   }
// };

upcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const userId = req.params.id;
    const userObjectId = new mongoose.Types.ObjectId(userId); 
    
    const upcomingEvents = await this._useCase.getAllUpcomingEvents(userObjectId);
console.log('upc',upcomingEvents)
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

updateSlotStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {



    const id = req.params.id;
    const objectid = new mongoose.Types.ObjectId(id);

  
    const date = req.body.date; 

   
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

   
    const updatedSlot = await this._useCase.updateslot(objectid, parsedDate);
    if (updatedSlot){
      if (typeof updatedSlot === "string") {
        return res
          .status(403)
          .json({ message: updatedSlot });
      }
     
    }
   
    return res.status(200).json({ message: "Slot updated successfully", data: updatedSlot });
  } catch (error) {
   
    next(error);
  }
};
getslotDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {


    const id = req.params.id;
 

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid performer ID format'
      });
    }

    const objectid = new mongoose.Types.ObjectId(id);

    const slotDetails = await this._useCase.slotDetails(objectid);
    console.log('slot',slotDetails)
    console.log(`[getslotDetails]: Slot Details - ${JSON.stringify(slotDetails)}`);


    return res.status(200).json({
      success: true,
      data: slotDetails
    });
  } catch (error) {
    console.error(`[getslotDetails]: Error - ${error}`);

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid performer ID'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
eventHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const userId = req.params.id;
    const userObjectId = new mongoose.Types.ObjectId(userId); 
    
    const eventHistory = await this._useCase.getAlleventHistory(userObjectId);

    if (eventHistory) {
      return res.status(200).json({ success: true, events: eventHistory });
    }

    return res.status(404).json({ success: false, message: 'No upcoming events found.' });
  } catch (error) {
    next(error);
  }
};
getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  
    const id = new mongoose.Types.ObjectId(req.params.id);
    const users = await this._useCase.getAllUsers(id);
    console.log("users fetched:", users);


    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error); 
  }
};
performerAllDetails= async (req: Request, res: Response, next: NextFunction) => {
  try {
 
    const Id = req.params.id;
 
    if (!Id) {
      return res.status(400).json({ error: 'Invalid performer ID' });
    }
    const performerId = new mongoose.Types.ObjectId(Id); 
    const performerDetails = await this._useCase.performerAllDetails(performerId);

   
    res.status(200).json({ performerDetails });
  } catch (error) {
    next(error);
  }
}
changeEventStatus= async (req: Request, res: Response, next: NextFunction) =>{
  
  return await this._useCase.changeEventStatus()
}
downloadReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const Id = req.params.id;
    const performerId = new mongoose.Types.ObjectId(Id);

    // Validate and parse startDate and endDate
    const start = startDate ? new Date(startDate as string) : null;
    const end = endDate ? new Date(endDate as string) : null;

    if (!(start instanceof Date) || isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid startDate' });
    }

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid endDate' });
    }

    // Fetch report data
    const report = await this._useCase.getReport(performerId, start, end);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Initialize Excel Workbook and Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performer Report', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Set column widths
    worksheet.columns = [
      { width: 30 },   // Title
      { width: 15 },   // Date
      { width: 5 },    // Spacer
      { width: 20 },   // Place
      { width: 12 },   // Price
      { width: 10 },   // Rating
      { width: 20 },   // Team Leader
      { width: 15 },   // Number
      { width: 5 },    // Spacer
      { width: 15 },   // Category
      { width: 15 }    // Status
    ];

    // Color Palette
    const colors = {
      headerBackground: 'FF4A90E2',  // Vibrant blue
      headerText: 'FFFFFFFF',        // White
      titleBackground: 'FFF0F4F8',   // Light blue background
      titleText: 'FF2C3E50',         // Dark blue text
      sectionTitleText: 'FF1A5F7A'   // Muted blue for section titles
    };

    // Report Title with Styling
    const titleRow = worksheet.addRow(['Performer Report']);
    titleRow.height = 30;
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.titleBackground }
    };
    titleCell.font = {
      name: 'Arial',
      size: 18,
      bold: true,
      color: { argb: colors.titleText }
    };
    titleCell.alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };

    // Total Programs Section
    worksheet.addRow([]);
    const statsRow = worksheet.addRow(['Total Programs', `  ${report.totalPrograms}`]);
    statsRow.getCell(1).font = { 
      bold: true, 
      size: 14, 
      color: { argb: colors.sectionTitleText } 
    };

    // Function to create table for events
    const createEventTable = (events: any[], title: string) => {
      // Check if events exist
      if (!events || events.length === 0) {
        return;
      }

      // Section Title
      worksheet.addRow([]);
      const sectionTitleRow = worksheet.addRow([title]);
      sectionTitleRow.getCell(1).font = { 
        bold: true, 
        size: 14, 
        color: { argb: colors.sectionTitleText } 
      };

      // Header Row
      const headerRow = worksheet.addRow([
        'Title', 'Date', '', 'Place', 'Price', 
        'Rating', 'Team Leader', 'Number', '', 
        'Category', 'Status'
      ]);

      // Style Header
      headerRow.eachCell((cell: { fill: { type: string; pattern: string; fgColor: { argb: string; }; }; font: { bold: boolean; color: { argb: string; }; name: string; }; alignment: { horizontal: string; vertical: string; }; border: { top: { style: string; }; left: { style: string; }; bottom: { style: string; }; right: { style: string; }; }; }) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colors.headerBackground }
        };
        cell.font = {
          bold: true,
          color: { argb: colors.headerText },
          name: 'Arial'
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Merge specific header cells
      worksheet.mergeCells(`B${headerRow.number}:C${headerRow.number}`);
      worksheet.mergeCells(`H${headerRow.number}:I${headerRow.number}`);

      // Add Event Data
      events.forEach((event, index) => {
        const dataRow = worksheet.addRow([
          event.title,
          event.date.toISOString().split('T')[0],
          '',
          event.place,
          event.price,
          event.rating,
          event.teamLeadername,
          event.teamLeaderNumber,
          '',
          event.category,
          event.status
        ]);

        // Apply alternating row colors
        dataRow.eachCell((cell: { fill: { type: string; pattern: string; fgColor: { argb: string; }; }; border: { bottom: { style: string; color: { argb: string; }; }; }; }) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: index % 2 ? 'FFF0F8FF' : 'FFFFFFFF' }
          };
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };
        });

        // Merge Date and Number columns
        worksheet.mergeCells(`B${dataRow.number}:C${dataRow.number}`);
        worksheet.mergeCells(`H${dataRow.number}:I${dataRow.number}`);
      });
    };

    // Conditionally render Upcoming Events
    createEventTable(report.upcomingEvent, 'Upcoming Events');

    // Conditionally render Event History
    createEventTable(report.eventHistory, 'Event History');

    // Finalize and Send the Report
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Performer_Report_${startDate}_to_${endDate}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};



 getUpcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {

 
    const id = req.params.id;
    console.log('upcomin',id)
    const performerId = new mongoose.Types.ObjectId(id); 
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
console.log('pate',page)
    const upcomingEvents = await this._useCase.getUpcomingEvents(performerId, page);
    console.log('ucountrredddfasfafaf123',upcomingEvents)
   return res.json({ events: upcomingEvents || [] });
  } catch (error) {
    next(error); 
  }
};

}