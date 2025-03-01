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
exports.adminController = void 0;
const responseStatus_1 = require("../../../constants/responseStatus");
const mongoose_1 = __importDefault(require("mongoose"));
const adminModel_1 = require("../../../infrastructure/models/adminModel");
const exceljs_1 = __importDefault(require("exceljs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class adminController {
    constructor(useCase) {
        this.useCase = useCase;
        this.adminLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Email and Password are required",
                    });
                }
                const admin = yield adminModel_1.AdminModel.findOne({ email });
                if (!admin) {
                    return res
                        .status(401)
                        .json({ success: false, message: "Invalid credentials" });
                }
                const isPasswordCorrect = yield bcrypt_1.default.compare(password, admin.password);
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
            }
            catch (error) {
                console.error("Error during admin login:", error);
                next(error);
            }
        });
        this.loginpost = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield bcrypt_1.default.hash("123", 10);
                yield adminModel_1.AdminModel.insertMany([
                    {
                        email: "admin@gmail.com",
                        password: hashedPassword,
                    },
                ]);
                res.status(201).json({ message: "Admin inserted successfully" });
            }
            catch (error) {
                next(error);
            }
        });
        this.checkSession = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const isAuthenticated = !!((_a = req.session) === null || _a === void 0 ? void 0 : _a.admin);
                return res.status(200).json({
                    isAuthenticated,
                    message: isAuthenticated
                        ? "Admin is authenticated"
                        : "Admin is not authenticated",
                });
            }
            catch (error) {
                console.error("Error checking session:", error);
                next(error);
            }
        });
        this.isSessionExist = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.admin) {
                    return res.status(200).json({
                        sessionExists: true,
                        message: "A session exists",
                    });
                }
                else {
                    return res.status(200).json({
                        sessionExists: false,
                        message: "No active session",
                    });
                }
            }
            catch (error) {
                console.error("Error checking if session exists:", error);
                return res.status(500).json({
                    sessionExists: false,
                    message: "Server error while checking session existence",
                });
            }
        });
        this.getAdminDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._useCase.getAdminDetails();
                return res.status(200).json({
                    success: true,
                    data: response,
                });
            }
            catch (error) {
                console.error("Error fetching admin details:", error);
                next(error); // Forward error to global error handler
            }
        });
        this.downloadReport = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                // Validate dates
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                if (!(start instanceof Date) || isNaN(start.getTime())) {
                    return res.status(400).json({ error: "Invalid startDate" });
                }
                if (!(end instanceof Date) || isNaN(end.getTime())) {
                    return res.status(400).json({ error: "Invalid endDate" });
                }
                // Get report data
                const report = yield this._useCase.getReport(start, end);
                // Generate Excel report
                const workbook = new exceljs_1.default.Workbook();
                const worksheet = workbook.addWorksheet("Admin Report");
                worksheet.columns = [
                    { header: "Metric", key: "metric", width: 25 },
                    { header: "Value", key: "value", width: 50 },
                ];
                worksheet.addRow({ metric: "Wallet Amount", value: report.walletAmount });
                worksheet.addRow({ metric: "Wallet Transaction History", value: "" });
                Object.entries(report.performerRegistrationHistory).forEach(([date, count]) => {
                    worksheet.addRow({ metric: `  - ${date}`, value: count });
                });
                worksheet.addRow({ metric: "Total Users", value: report.totalUsers });
                worksheet.addRow({
                    metric: "Total Performers",
                    value: report.totalPerformers,
                });
                worksheet.addRow({ metric: "User Registration History", value: "" });
                Object.entries(report.userRegistrationHistory).forEach(([date, count]) => {
                    worksheet.addRow({ metric: `  - ${date}`, value: count });
                });
                worksheet.addRow({ metric: "Performer Registration History", value: "" });
                Object.entries(report.performerRegistrationHistory).forEach(([date, count]) => {
                    worksheet.addRow({ metric: `  - ${date}`, value: count });
                });
                // Set response headers for Excel file download
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", `attachment; filename=Admin_Report_${startDate}_to_${endDate}.xlsx`);
                yield workbook.xlsx.write(res);
                res.end();
            }
            catch (error) {
                next(error);
            }
        });
        this.adminLogout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.admin) {
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
                }
                else {
                    return res
                        .status(400)
                        .json({ success: false, message: "No admin logged in" });
                }
            }
            catch (error) {
                console.error("Error during admin logout:", error);
                return res.status(500).json({ success: false, message: "Server error" });
            }
        });
        this.allTempPerformers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tempPerformers = yield this.useCase.getTempPerformer();
                if (tempPerformers) {
                    res.status(200).json({ success: true, data: tempPerformers });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this.grandedPermission = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                console.log(userId, 'sfdal;fjlas');
                const id = new mongoose_1.default.Types.ObjectId(userId);
                if (!id) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Invalid ID provided" });
                }
                const permitedUser = yield this.useCase.grantedPermission(id);
                if (permitedUser) {
                    return res.status(200).json({ success: true, data: permitedUser });
                }
                else {
                    return res.status(404).json({
                        success: false,
                        message: "Performer not found or permission not granted",
                    });
                }
            }
            catch (error) {
                next(error);
            }
        });
        this.rejectedPermission = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const rejectReason = req.body.rejectReason;
                // Validate ID format
                if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Invalid ID provided" });
                }
                const permitedUser = yield this.useCase.rejectedPermission(id, rejectReason);
                if (permitedUser) {
                    return res.status(200).json({
                        success: true,
                        data: permitedUser,
                        message: "Permission rejected successfully",
                    });
                }
                else {
                    return res.status(404).json({
                        success: false,
                        message: "Performer not found or permission not granted",
                    });
                }
            }
            catch (error) {
                console.error("Error in rejectedPermission controller:", error);
                next(error);
            }
        });
        this.getAllPerformers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const performers = yield this._useCase.getAllPerformer();
                if (!performers || performers.length === 0) {
                    return res.status(404).json({ message: "No performers found." });
                }
                res.status(200).json({ success: true, data: performers });
            }
            catch (error) {
                console.error("Error fetching performers:", error);
                next(error);
            }
        });
        this.blockunblockperformer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                if (!userId) {
                    return res
                        .status(400)
                        .json({ success: false, message: "User ID is required" });
                }
                const { isblocked, isPerfomerBlock, } = req.body;
                // Call the use case with both statuses
                const performerStatusChange = yield this._useCase.performerStatusChange(userId, isblocked, isPerfomerBlock);
                res.status(200).json({ success: true, user: performerStatusChange });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ success: false, message: error.message });
                }
                else {
                    res
                        .status(500)
                        .json({ success: false, message: "An unknown error occurred" });
                }
            }
        });
        this.allUsers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this._useCase.getAllUser();
                if (!users || users.length === 0) {
                    return res
                        .status(responseStatus_1.ResponseStatus.NotFound)
                        .json({ message: "No users found." });
                }
                res.status(responseStatus_1.ResponseStatus.OK).json(users);
            }
            catch (error) {
                console.error("Error fetching users:", error);
                next(error);
            }
        });
        this.blockunblockuser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { isblocked } = req.body;
                const userStatusChange = yield this._useCase.userStatusChange(id, isblocked);
                res.status(200).json({ success: true, user: userStatusChange });
            }
            catch (error) {
                next(error);
            }
        });
        this.getAllEvents = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allEvents = yield this._useCase.getAllEvents();
                if (!allEvents || allEvents.length === 0) {
                    return res.status(204).json(null);
                }
                res.status(200).json(allEvents);
            }
            catch (error) {
                console.error("Error fetching events:", error);
                next(error);
            }
        });
        this.toggleBlockStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                        message: "Blocking reason and duration are required for blocking an event.",
                    });
                }
                const blockingDetails = action === "block" ? { reason, duration } : undefined;
                const changedEvent = yield this._useCase.toggleBlockStatus(id, blockingDetails);
                if (!changedEvent) {
                    return res
                        .status(404)
                        .json({ message: "Event not found or update failed" });
                }
                res.status(200).json({
                    message: `Event successfully ${action === "block" ? "blocked" : "unblocked"}`,
                    data: changedEvent,
                });
            }
            catch (error) {
                console.error("Error toggling block status:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        this.getRevenue = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { page } = req.query;
                const pageNumber = parseInt(page) || 1;
                const pageSize = 10;
                const offset = (pageNumber - 1) * pageSize;
                const revenueData = yield this._useCase.getRevenue(offset, pageSize);
                if (!revenueData) {
                    return res.status(404).json({ message: "No revenue data found." });
                }
                return res.status(200).json({
                    totalCount: revenueData.totalCount,
                    adminRevinue: revenueData.adminRevinue,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(revenueData.totalCount / pageSize),
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.b = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.send('hello bhai');
                console.log('heleoeoeoodafs');
            }
            catch (error) {
                next(error);
            }
        });
        this._useCase = useCase;
    }
}
exports.adminController = adminController;
