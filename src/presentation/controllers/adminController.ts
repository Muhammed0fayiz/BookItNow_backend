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
  
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and Password are required',
        });
      }
  
      // Validate email and password with environment variables
      if (email === process.env.Admin_Email && password === process.env.Admin_password) {
        req.session.admin = { email }; // Store admin details in session
        return res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
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
  
  
}
