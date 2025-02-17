import { Response, Request, NextFunction } from "express";
import { ResponseStatus } from "../../../constants/responseStatus";


import { IadminUseCase } from "../../../application/interfaces/admin/IadminUseCase";
import mongoose from "mongoose";
import { AdminModel } from "../../../infrastructure/models/adminModel";
import ExcelJS from "exceljs";

import bcrypt from "bcrypt";
export class adminController {
  private _useCase: IadminUseCase;
  constructor(private useCase: IadminUseCase) {
    this._useCase = useCase;
  }

 
  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }
        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }
        req.session.admin = { email: admin.email };
        return res.status(200).json({
            success: true,
            message: "Login successful",
            admin: {
                email: admin.email,
                walletAmount: admin.walletAmount,
            },
        });
    } catch (error) {
        console.error("Error during admin login:", error);
        next(error);
    }
};
loginpost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashedPassword = await bcrypt.hash("123", 10);
    await AdminModel.insertMany([
      {
        email: "admin@gmail.com",
        password: hashedPassword,
      },
    ]);
    res.status(201).json({ message: "Admin inserted successfully" });
  } catch (error) {
    next(error);
  }
};
checkSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthenticated = !!req.session?.admin;
    return res.status(200).json({
      isAuthenticated,
      message: isAuthenticated
        ? "Admin is authenticated"
        : "Admin is not authenticated",
    });
  } catch (error) {
    console.error("Error checking session:", error);
    next(error); 
  }
};
  isSessionExist = async (req: Request, res: Response) => {
    try {
      if (req.session?.admin) {
        return res.status(200).json({
          sessionExists: true,
          message: "A session exists",
        });
      } else {
        return res.status(200).json({
          sessionExists: false,
          message: "No active session",
        });
      }
    } catch (error) {
      console.error("Error checking if session exists:", error);
      return res.status(500).json({
        sessionExists: false,
        message: "Server error while checking session existence",
      });
    }
  };
  getAdminDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this._useCase.getAdminDetails();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error("Error fetching admin details:", error);
      next(error); // Forward error to global error handler
    }
  };
  downloadReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      // Validate dates
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      if (!(start instanceof Date) || isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid startDate" });
      }
      if (!(end instanceof Date) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid endDate" });
      }
      // Get report data
      const report = await this._useCase.getReport(start, end);
      // Generate Excel report
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Admin Report");
      worksheet.columns = [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Value", key: "value", width: 50 },
      ];
      worksheet.addRow({ metric: "Wallet Amount", value: report.walletAmount });
      worksheet.addRow({ metric: "Wallet Transaction History", value: "" });
      Object.entries(report.performerRegistrationHistory).forEach(
        ([date, count]) => {
          worksheet.addRow({ metric: `  - ${date}`, value: count });
        }
      );
      worksheet.addRow({ metric: "Total Users", value: report.totalUsers });
      worksheet.addRow({
        metric: "Total Performers",
        value: report.totalPerformers,
      });
      worksheet.addRow({ metric: "User Registration History", value: "" });
      Object.entries(report.userRegistrationHistory).forEach(
        ([date, count]) => {
          worksheet.addRow({ metric: `  - ${date}`, value: count });
        }
      );
      worksheet.addRow({ metric: "Performer Registration History", value: "" });
      Object.entries(report.performerRegistrationHistory).forEach(
        ([date, count]) => {
          worksheet.addRow({ metric: `  - ${date}`, value: count });
        }
      );
      // Set response headers for Excel file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Admin_Report_${startDate}_to_${endDate}.xlsx`
      );
 
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  };
  adminLogout = async (req: Request, res: Response) => {
    try {
      if (req.session?.admin) {
        req.session.destroy((err) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: "Failed to log out" });
          }
          return res
            .status(200)
            .json({ success: true, message: "Logout successful" });
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "No admin logged in" });
      }
    } catch (error) {
      console.error("Error during admin logout:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
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
      const {userId}=req.params
      console.log(userId,'sfdal;fjlas')
        const id = new mongoose.Types.ObjectId(userId);
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID provided" });
      }
      const permitedUser = await this.useCase.grantedPermission(id);
      if (permitedUser) {
        return res.status(200).json({ success: true, data: permitedUser });
      } else {
        return res.status(404).json({
          success: false,
          message: "Performer not found or permission not granted",
        });
      }
    } catch (error) {
      next(error);
    }
  };
  rejectedPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
 const {id} =req.params
      const rejectReason = req.body.rejectReason;
      // Validate ID format
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID provided" });
      }
      const permitedUser = await this.useCase.rejectedPermission(
        id,
        rejectReason
      );

      if (permitedUser) {
        return res.status(200).json({
          success: true,
          data: permitedUser,
          message: "Permission rejected successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Performer not found or permission not granted",
        });
      }
    } catch (error) {
      console.error("Error in rejectedPermission controller:", error);
      next(error);
    }
  };
  getAllPerformers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const performers = await this._useCase.getAllPerformer();

      if (!performers || performers.length === 0) {
        return res.status(404).json({ message: "No performers found." });
      }
      res.status(200).json({ success: true, data: performers });
    } catch (error) {
      console.error("Error fetching performers:", error);
      next(error);
    }
  };
  blockunblockperformer = async (
    req: Request,
    res: Response  ) => {
    try {
      const userId: string = req.params.id;
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
      if (error instanceof Error) {
        res.status(500).json({ success: false, message: error.message });
      } else {
        res
          .status(500)
          .json({ success: false, message: "An unknown error occurred" });
      }
    }
  };
  allUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this._useCase.getAllUser();
      if (!users || users.length === 0) {
        return res
          .status(ResponseStatus.NotFound)
          .json({ message: "No users found." });
      }
      res.status(ResponseStatus.OK).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      next(error);
    }
  };
  blockunblockuser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
     const {id}=req.params
      const { isblocked }: { isblocked: boolean } = req.body;
      const userStatusChange = await this._useCase.userStatusChange(
        id,
        isblocked
      );
      res.status(200).json({ success: true, user: userStatusChange });
    } catch (error) {
      next(error);
    }
  };
  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allEvents = await this._useCase.getAllEvents();
      if (!allEvents || allEvents.length === 0) {
        return res.status(204).json(null);
      }
      res.status(200).json(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      next(error);
    }
  };
  toggleBlockStatus = async (
    req: Request,
    res: Response  ) => {
    try {
      const { id } = req.params;
      const { reason, duration, action } = req.body;

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ message: "Invalid or missing ID parameter" });
      }

      if (action === "block" && (!reason || !duration)) {
        return res
          .status(400)
          .json({
            message:
              "Blocking reason and duration are required for blocking an event.",
          });
      }

      const blockingDetails =
        action === "block" ? { reason, duration } : undefined;
      const changedEvent = await this._useCase.toggleBlockStatus(
        id,
        blockingDetails
      );

      if (!changedEvent) {
        return res
          .status(404)
          .json({ message: "Event not found or update failed" });
      }

      res.status(200).json({
        message: `Event successfully ${
          action === "block" ? "blocked" : "unblocked"
        }`,
        data: changedEvent,
      });
    } catch (error) {
      console.error("Error toggling block status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  getRevenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 10;

      const offset = (pageNumber - 1) * pageSize;

      const revenueData = await this._useCase.getRevenue(offset, pageSize);

      if (!revenueData) {
        return res.status(404).json({ message: "No revenue data found." });
      }

      return res.status(200).json({
        totalCount: revenueData.totalCount,
        adminRevinue: revenueData.adminRevinue,
        currentPage: pageNumber,
        totalPages: Math.ceil(revenueData.totalCount / pageSize),
      });
    } catch (error) {
      next(error);
    }
  };
  b=async (req: Request, res: Response, next: NextFunction) => {
    try {
    console.log('heleoeoeoodafs');
    
    } catch (error) {
      next(error);
    }
  };
}
