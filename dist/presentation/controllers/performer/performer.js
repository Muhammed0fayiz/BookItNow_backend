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
exports.performerController = void 0;
const validEmail_1 = require("../../../shared/utils/validEmail");
const responseStatus_1 = require("../../../constants/responseStatus");
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("../../../shared/utils/constant");
const performerModel_1 = require("../../../infrastructure/models/performerModel");
const ExcelJS = require("exceljs");
class performerController {
    constructor(useCase) {
        this.useCase = useCase;
        this.addTempPerformer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { bandName, mobileNumber, description, user_id } = req.body;
                const video = req.file;
                const response = yield this._useCase.videoUpload(bandName, mobileNumber, description, user_id, video);
                if (response) {
                    return res.status(responseStatus_1.ResponseStatus.Accepted).json({ response });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this.getAllUsers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = new mongoose_1.default.Types.ObjectId(req.params.id);
                const users = yield this._useCase.getAllUsers(id);
                if (!users || users.length === 0) {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: constant_1.ErrorMessages.NO_USERS_FOUND });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json({ success: true, data: users });
            }
            catch (error) {
                console.error("Error fetching users:", error);
                next(error);
            }
        });
        this.performerAllDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ error: "Invalid performer ID" });
                }
                const performerId = new mongoose_1.default.Types.ObjectId(id);
                const performerDetails = yield this._useCase.performerAllDetails(performerId);
                res.status(responseStatus_1.ResponseStatus.OK).json({ performerDetails });
            }
            catch (error) {
                next(error);
            }
        });
        this.performerLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.ErrorMessages.NO_PERFORMER_FOUND });
                }
                const performer = {
                    email: req.body.email ? req.body.email.trim() : null,
                    password: req.body.password ? req.body.password.trim() : null,
                };
                if (!performer.password || !performer.email) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.PASSWORD_EMAIL_REQUIRED });
                }
                if (!(0, validEmail_1.isValidEmail)(performer.email)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.INVALID_EMAIL });
                }
                const loginPerformer = yield this._useCase.loginPerformer(performer.email, performer.password);
                if (loginPerformer) {
                    if (typeof loginPerformer === "string") {
                        return res
                            .status(responseStatus_1.ResponseStatus.Forbidden)
                            .json({ message: "Ok" });
                    }
                    const token = yield this._useCase.jwt(loginPerformer);
                    res.status(responseStatus_1.ResponseStatus.Accepted).json({ token: token });
                }
                else {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.PerformerMessages.PERFORMER_NOT_FOUND });
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
        this.getPerformerDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.INVALID_USER_ID });
                }
                const objectId = new mongoose_1.default.Types.ObjectId(id);
                const response = yield this._useCase.getPerformerDetails(objectId);
                if (response) {
                    return res
                        .status(responseStatus_1.ResponseStatus.Accepted)
                        .json({ message: constant_1.UserMessages.USER_DETAILS_SUCCESS, response });
                }
                else {
                    return res
                        .status(responseStatus_1.ResponseStatus.BadRequest)
                        .json({ message: constant_1.UserMessages.USER_DETAILS_FAILED });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this.updatePerformerProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { bandName, mobileNumber, place } = req.body;
                const image = req.file ? `/uploads/${req.file.filename}` : null;
                const updateData = {};
                if (bandName)
                    updateData.bandName = bandName;
                if (mobileNumber)
                    updateData.mobileNumber = mobileNumber;
                if (place)
                    updateData.place = place;
                if (image)
                    updateData.profileImage = image;
                // Perform the update operation
                const updatedPerformer = yield performerModel_1.PerformerModel.updateOne({ userId: id }, { $set: updateData });
                if (updatedPerformer.modifiedCount > 0) {
                    res
                        .status(responseStatus_1.ResponseStatus.OK)
                        .json({ message: constant_1.UserMessages.PROFILE_UPDATE_SUCCESS, updatedPerformer });
                }
                else {
                    res.status(responseStatus_1.ResponseStatus.NotFound).json({ message: constant_1.UserMessages.USER_NOT_FOUND_UPDATE });
                }
            }
            catch (error) {
                console.error("Error updating user profile:", error);
                next(error);
                if (error instanceof Error) {
                    res
                        .status(responseStatus_1.ResponseStatus.InternalSeverError)
                        .json({ message: "Error updating profile", error: error.message });
                }
                else {
                    res.status(responseStatus_1.ResponseStatus.InternalSeverError).json({ message: constant_1.UserMessages.UNKNOWN_ERROR });
                }
            }
        });
        this.downloadReport = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const { id } = req.params;
                const performerId = new mongoose_1.default.Types.ObjectId(id);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                if (!(start instanceof Date) || isNaN(start.getTime())) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ error: "Invalid startDate" });
                }
                if (!(end instanceof Date) || isNaN(end.getTime())) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ error: "Invalid endDate" });
                }
                const report = yield this._useCase.getReport(performerId, start, end);
                if (!report) {
                    return res.status(responseStatus_1.ResponseStatus.NotFound).json({ error: "Report not found" });
                }
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet("Performer Report", {
                    pageSetup: { paperSize: 9, orientation: "landscape" },
                });
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
                    "Total Events",
                    `  ${report.totalPrograms}`,
                ]);
                statsRow.getCell(1).font = {
                    bold: true,
                    size: 14,
                    color: { argb: colors.sectionTitleText },
                };
                const createEventTable = (events, title) => {
                    if (!events || events.length === 0) {
                        return;
                    }
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
                    headerRow.eachCell((cell) => {
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
                    });
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
                        dataRow.eachCell((cell) => {
                            cell.fill = {
                                type: "pattern",
                                pattern: "solid",
                                fgColor: { argb: index % 2 ? "FFF0F8FF" : "FFFFFFFF" },
                            };
                            cell.border = {
                                bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
                            };
                        });
                        worksheet.mergeCells(`B${dataRow.number}:C${dataRow.number}`);
                        worksheet.mergeCells(`H${dataRow.number}:I${dataRow.number}`);
                    });
                };
                createEventTable(report.upcomingEvent, "Upcoming Events");
                createEventTable(report.eventHistory, "Event History");
                // Finalize and Send the Report
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", `attachment; filename=Performer_Report_${startDate}_to_${endDate}.xlsx`);
                yield workbook.xlsx.write(res);
                res.end();
            }
            catch (error) {
                next(error);
            }
        });
        this.updateSlotStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const objectid = new mongoose_1.default.Types.ObjectId(id);
                const date = req.body.date;
                if (!date) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.UserMessages.NO_DATA });
                }
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({ message: constant_1.PerformerMessages.INVALID_DATE });
                }
                const updatedSlot = yield this._useCase.updateslot(objectid, parsedDate);
                if (updatedSlot) {
                    if (typeof updatedSlot === "string") {
                        return res.status(responseStatus_1.ResponseStatus.Forbidden).json({ message: updatedSlot });
                    }
                }
                return res
                    .status(responseStatus_1.ResponseStatus.OK)
                    .json({ message: "Slot updated successfully", data: updatedSlot });
            }
            catch (error) {
                next(error);
            }
        });
        this.getslotDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({
                        success: false,
                        message: constant_1.PerformerMessages.INVALID_PERFORMER_ID,
                    });
                }
                const objectid = new mongoose_1.default.Types.ObjectId(id);
                const slotDetails = yield this._useCase.slotDetails(objectid);
                return res.status(responseStatus_1.ResponseStatus.OK).json({
                    success: true,
                    data: slotDetails,
                });
            }
            catch (error) {
                console.error(`[getslotDetails]: Error - ${error}`);
                next(error);
                if (error instanceof mongoose_1.default.Error.CastError) {
                    return res.status(responseStatus_1.ResponseStatus.BadRequest).json({
                        success: false,
                        message: constant_1.PerformerMessages.INVALID_PERFORMER_ID,
                    });
                }
                return res.status(responseStatus_1.ResponseStatus.InternalSeverError).json({
                    success: false,
                    message: constant_1.MessageConstants.INTERANAL_SERVER_ERROR,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        this._useCase = useCase;
    }
}
exports.performerController = performerController;
