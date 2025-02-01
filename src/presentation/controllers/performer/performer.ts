import { loginpefomer } from "../../../../../frontend/src/datas/logindatas";
import { Response, Request, NextFunction } from "express";
import { isValidEmail } from "../../../shared/utils/validEmail";
import { ResponseStatus } from "../../../constants/responseStatus";
import { IperformerUseCase } from "../../../application/interfaces/performer/useCase/performer";
import { asPerformer } from "../../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";
import { MessageConstants, OTPMessages, UserMessages,ErrorMessages, PerformerMessages} from "../../../shared/utils/constant";
import {
  PerformerDocuments,
  PerformerModel,
} from "../../../infrastructure/models/performerModel";
const ExcelJS = require("exceljs");
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
      const response = await this._useCase.videoUpload(
        bandName,
        mobileNumber,
        description,
        user_id,
        video
      );
      if (response) {
        return res.status(ResponseStatus.Accepted).json({ response });
      }
    } catch (error) {
      next(error);
    }
  };
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const users = await this._useCase.getAllUsers(id);
      if (!users || users.length === 0) {
        return res.status(ResponseStatus.NotFound).json({ message: ErrorMessages.NO_USERS_FOUND });
      }
      res.status(ResponseStatus.OK).json({ success: true, data: users });
    } catch (error) {
      console.error("Error fetching users:", error);
      next(error);
    }
  };
  performerAllDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
const {id}=req.params
      if (!id) {
        return res.status(ResponseStatus.BadRequest).json({ error: "Invalid performer ID" });
      }
      const performerId = new mongoose.Types.ObjectId(id);
      const performerDetails = await this._useCase.performerAllDetails(
        performerId
      );
      res.status(ResponseStatus.OK).json({ performerDetails });
    } catch (error) {
      next(error);
    }
  };
  performerLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: ErrorMessages.NO_PERFORMER_FOUND });
      }
      const performer = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
      };
      if (!performer.password || !performer.email) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.PASSWORD_EMAIL_REQUIRED });
      }

      if (!isValidEmail(performer.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.INVALID_EMAIL });
      }
      const loginPerformer = await this._useCase.loginPerformer(
        performer.email,
        performer.password
      );
      if (loginPerformer) {
        if (typeof loginPerformer === "string") {
          return res
            .status(ResponseStatus.Forbidden)
            .json({ message: loginpefomer });
        }
        const token = await this._useCase.jwt(loginPerformer as asPerformer);
        res.status(ResponseStatus.Accepted).json({ token: token });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: PerformerMessages.PERFORMER_NOT_FOUND});
      }
    } catch (error) {
      console.log(error);
    }
  };
  getPerformerDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
 const {id}=req.params
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.INVALID_USER_ID });
      }
      const objectId = new mongoose.Types.ObjectId(id); 
      const response = await this._useCase.getPerformerDetails(objectId);

      if (response) {
        return res
          .status(ResponseStatus.Accepted)
          .json({ message: UserMessages.USER_DETAILS_SUCCESS, response });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: UserMessages.USER_DETAILS_FAILED });
      }
    } catch (error) {
      next(error); // Pass the error to the next middleware
    }
  };
  updatePerformerProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const { bandName, mobileNumber, place } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;
      const updateData: {
        bandName?: string;
        mobileNumber?: string;
        place?: string;
        profileImage?: string | null;
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
        res
          .status(ResponseStatus.OK)
          .json({ message: UserMessages.PROFILE_UPDATE_SUCCESS, updatedPerformer });
      } else {
        res.status(ResponseStatus.NotFound).json({ message: UserMessages.USER_NOT_FOUND_UPDATE });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);

      if (error instanceof Error) {
        res
          .status(ResponseStatus.InternalSeverError)
          .json({ message: "Error updating profile", error: error.message });
      } else {
        res.status(ResponseStatus.InternalSeverError).json({ message: UserMessages.UNKNOWN_ERROR});
      }
    }
  };
  downloadReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      const {id}=req.params;
      const performerId = new mongoose.Types.ObjectId(id);
      // Validate and parse startDate and endDate
      const start = startDate ? new Date(startDate as string) : null;
      const end = endDate ? new Date(endDate as string) : null;
      if (!(start instanceof Date) || isNaN(start.getTime())) {
        return res.status(ResponseStatus.BadRequest).json({ error: "Invalid startDate" });
      }
      if (!(end instanceof Date) || isNaN(end.getTime())) {
        return res.status(ResponseStatus.BadRequest).json({ error: "Invalid endDate" });
      }

      // Fetch report data
      const report = await this._useCase.getReport(performerId, start, end);

      if (!report) {
        return res.status(ResponseStatus.NotFound).json({ error: "Report not found" });
      }

      // Initialize Excel Workbook and Worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Performer Report", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
      });

      // Set column widths
      worksheet.columns = [
        { width: 30 },
        { width: 15 },
        { width: 5 },
        { width: 20 },
        { width: 12 },
        { width: 10 },
        { width: 20 },
        { width: 15 },
        { width: 5 },
        { width: 15 },
        { width: 15 },
      ];

      const colors = {
        headerBackground: "FF4A90E2",
        headerText: "FFFFFFFF",
        titleBackground: "FFF0F4F8",
        titleText: "FF2C3E50",
        sectionTitleText: "FF1A5F7A",
      };

      const titleRow = worksheet.addRow(["Performer Report"]);
      titleRow.height = 30;
      worksheet.mergeCells("A1:K1");
      const titleCell = worksheet.getCell("A1");
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colors.titleBackground },
      };
      titleCell.font = {
        name: "Arial",
        size: 18,
        bold: true,
        color: { argb: colors.titleText },
      };
      titleCell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      worksheet.addRow([]);
      const statsRow = worksheet.addRow([
        "Total Programs",
        `  ${report.totalPrograms}`,
      ]);
      statsRow.getCell(1).font = {
        bold: true,
        size: 14,
        color: { argb: colors.sectionTitleText },
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
          color: { argb: colors.sectionTitleText },
        };

        // Header Row
        const headerRow = worksheet.addRow([
          "Title",
          "Date",
          "",
          "Place",
          "Price",
          "Rating",
          "Team Leader",
          "Number",
          "",
          "Category",
          "Status",
        ]);

        // Style Header
        headerRow.eachCell(
          (cell: {
            fill: { type: string; pattern: string; fgColor: { argb: string } };
            font: { bold: boolean; color: { argb: string }; name: string };
            alignment: { horizontal: string; vertical: string };
            border: {
              top: { style: string };
              left: { style: string };
              bottom: { style: string };
              right: { style: string };
            };
          }) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: colors.headerBackground },
            };
            cell.font = {
              bold: true,
              color: { argb: colors.headerText },
              name: "Arial",
            };
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
            };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        );

        // Merge specific header cells
        worksheet.mergeCells(`B${headerRow.number}:C${headerRow.number}`);
        worksheet.mergeCells(`H${headerRow.number}:I${headerRow.number}`);

        // Add Event Data
        events.forEach((event, index) => {
          const dataRow = worksheet.addRow([
            event.title,
            event.date.toISOString().split("T")[0],
            "",
            event.place,
            event.price,
            event.rating,
            event.teamLeadername,
            event.teamLeaderNumber,
            "",
            event.category,
            event.status,
          ]);

          // Apply alternating row colors
          dataRow.eachCell(
            (cell: {
              fill: {
                type: string;
                pattern: string;
                fgColor: { argb: string };
              };
              border: { bottom: { style: string; color: { argb: string } } };
            }) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: index % 2 ? "FFF0F8FF" : "FFFFFFFF" },
              };
              cell.border = {
                bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
              };
            }
          );

          // Merge Date and Number columns
          worksheet.mergeCells(`B${dataRow.number}:C${dataRow.number}`);
          worksheet.mergeCells(`H${dataRow.number}:I${dataRow.number}`);
        });
      };

      // Conditionally render Upcoming Events
      createEventTable(report.upcomingEvent, "Upcoming Events");

      // Conditionally render Event History
      createEventTable(report.eventHistory, "Event History");

      // Finalize and Send the Report
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Performer_Report_${startDate}_to_${endDate}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  };

  updateSlotStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
const {id}=req.params
      const objectid = new mongoose.Types.ObjectId(id);
      const date = req.body.date;
      if (!date) {
        return res.status(ResponseStatus.BadRequest).json({ message:UserMessages.NO_DATA });
      }
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(ResponseStatus.BadRequest).json({ message: PerformerMessages.INVALID_DATE});
      }
      const updatedSlot = await this._useCase.updateslot(objectid, parsedDate);
      if (updatedSlot) {
        if (typeof updatedSlot === "string") {
          return res.status(ResponseStatus.Forbidden).json({ message: updatedSlot });
        }
      }

      return res
        .status(ResponseStatus.OK)
        .json({ message: "Slot updated successfully", data: updatedSlot });
    } catch (error) {
      next(error);
    }
  };
  getslotDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const {id}=req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(ResponseStatus.BadRequest).json({
          success: false,
          message:PerformerMessages.INVALID_PERFORMER_ID,
        });
      }
      const objectid = new mongoose.Types.ObjectId(id);
      const slotDetails = await this._useCase.slotDetails(objectid);
      return res.status(ResponseStatus.OK).json({
        success: true,
        data: slotDetails,
      });
    } catch (error) {
      console.error(`[getslotDetails]: Error - ${error}`);

      if (error instanceof mongoose.Error.CastError) {
        return res.status(ResponseStatus.BadRequest).json({
          success: false,
          message:PerformerMessages.INVALID_PERFORMER_ID,
        });
      }

      return res.status(ResponseStatus.InternalSeverError).json({
        success: false,
        message: MessageConstants.INTERANAL_SERVER_ERROR,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
