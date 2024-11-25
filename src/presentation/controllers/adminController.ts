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
import { IadminUseCase } from "../../application/interfaces/IadminUseCase";
import mongoose from "mongoose";
import { AdminModel } from "../../infrastructure/models/adminModel";

import bcrypt from "bcrypt";
export class adminController {
  private _useCase: IadminUseCase;
 
    

  constructor(private useCase: IadminUseCase) {
    this._useCase = useCase;
  }

  allUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this._useCase.getAllUser();
      console.log("users", users);
      if (!users || users.length === 0) {
        return res
          .status(ResponseStatus.NotFound)
          .json({ message: "No users found." });
      }

      // Optional: Log the users if needed
      res.status(ResponseStatus.OK).json(users); // Send users in the response
    } catch (error) {
      console.error("Error fetching users:", error);
      next(error); // Pass the error to the error handling middleware
    }
  };

  blockunblockuser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id: string = req.params.id;
      // Extract user ID from params and type it as a string
      console.log(id, "is id");
      console.log("user is their");
      const { isblocked }: { isblocked: boolean } = req.body; // Destructure isblocked from the body with the expected type

      const userStatusChange = await this._useCase.userStatusChange(
        id,
        isblocked
      ); // Pass the ID and status to the use case

      res.status(200).json({ success: true, user: userStatusChange });
    } catch (error) {
      next(error); // Pass any errors to the error handling middleware
    }
  };

  blockunblockperformer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId: string = req.params.id;
      console.log("block performer", userId, "block user");

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const {
        isblocked,
        isPerfomerBlock,
      }: { isblocked: boolean; isPerfomerBlock: boolean } = req.body;

      // Call the use case with both statuses
      const performerStatusChange = await this._useCase.performerStatusChange(
        userId,
        isblocked,
        isPerfomerBlock
      );

      res.status(200).json({ success: true, user: performerStatusChange });
    } catch (error) {
      console.error("Error in blockunblockperformer:", error);
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "An unknown error occurred" });
      }
    }
  };

  // Inside your controller
  allTempPerformers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
    

      const tempPerformers = await this.useCase.getTempPerformer();

      if (tempPerformers) {
        res.status(200).json({ success: true, data: tempPerformers });
      }
    } catch (error) {
      next(error);
    }
  };

  grandedPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
     
      const id: string = req.params.id;
    

      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID provided" });
      }

      const permitedUser = await this.useCase.grantedPermission(id);

      if (permitedUser) {
        return res.status(200).json({ success: true, data: permitedUser });
      } else {
        return res
          .status(404)
          .json({
            success: false,
            message: "Performer not found or permission not granted",
          });
      }
    } catch (error) {
      next(error); // Pass the error to the error-handling middleware
    }
  };

  rejectedPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
     
      const id: string = req.params.id;
      console.log("ID received:", id);

      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID provided" });
      }

      const permitedUser = await this.useCase.rejectedPermission(id);

      if (permitedUser) {
        return res
          .status(200)
          .json({
            success: true,
            data: permitedUser,
            message: "Permission rejected successfully",
          });
      } else {
        return res
          .status(404)
          .json({
            success: false,
            message: "Performer not found or permission not granted",
          });
      }
    } catch (error) {
      console.error("Error in rejectedPermission controller:", error);
      next(error); // Pass the error to the error-handling middleware
    }
  };
  // revokedPermission

  getAllPerformers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("Fetching all performers...");

      // Fetch all performers using the use case
      const performers = await this._useCase.getAllPerformer();
      console.log("Performers fetched:", performers);

      // Check if performers exist
      if (!performers || performers.length === 0) {
        return res.status(404).json({ message: "No performers found." });
      }

      // Respond with the fetched performers
      res.status(200).json({ success: true, data: performers });
    } catch (error) {
      console.error("Error fetching performers:", error);
      next(error); // Pass the error to the error handling middleware
    }
  };

 

adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and Password are required',
        });
      }
  
      const admin = await AdminModel.findOne({ email });
  
      if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
  
      req.session.admin = { email: admin.email }; 
  
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
          email: admin.email,
          walletAmount: admin.walletAmount,
        },
      });
    } catch (error) {
      console.error('Error during admin login:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  


  checkSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the admin session exists
      if (req.session?.admin) {
        return res.status(200).json({
          isAuthenticated: true,
          message: 'Admin is authenticated',
        });
      } else {
        return res.status(200).json({
          isAuthenticated: false,
          message: 'Admin is not authenticated',
        });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      return res.status(500).json({
        isAuthenticated: false,
        message: 'Server error while checking session',
      });
    }
  };
  



  adminLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the admin is logged in
      if (req.session?.admin) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, message: 'Failed to log out' });
          }
          return res.status(200).json({ success: true, message: 'Logout successful' });
        });
      } else {
        return res.status(400).json({ success: false, message: 'No admin logged in' });
      }
    } catch (error) {
      console.error('Error during admin logout:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  isSessionExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if any session exists (for example, a user or admin)
      if (req.session?.admin) {
        return res.status(200).json({
          sessionExists: true,
          message: 'A session exists',
        });
      } else {
        return res.status(200).json({
          sessionExists: false,
          message: 'No active session',
        });
      }
    } catch (error) {
      console.error('Error checking if session exists:', error);
      return res.status(500).json({
        sessionExists: false,
        message: 'Server error while checking session existence',
      });
    }
  };
  
  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allEvents = await this._useCase.getAllEvents();

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
  toggleBlockStatus = async (req: Request, res: Response, next: NextFunction) => {
    try { 
      const { id } = req.params;
  console.log('hwll',id)
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


  loginpost = async (req: Request, res: Response, next: NextFunction) => {

    try {
    
    console.log('fay')
      const hashedPassword = await bcrypt.hash('123', 10);
  
      // Insert a single admin document with hashed password
      await AdminModel.insertMany([
        {
          email: 'admin@gmail.com',
          password: hashedPassword,
        },
      ]);
  
      res.status(201).json({ message: 'Admin inserted successfully' });
    } catch (error) {
      next(error);
    }
  };
  getAdminDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this._useCase.getAdminDetails();
      console.log('response', response);
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Error fetching admin details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch admin details. Please try again later.',
      });
    }
  };
  

}
