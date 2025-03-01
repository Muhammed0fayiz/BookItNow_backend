"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../controllers/admin/admin");
const admin_2 = require("../../application/useCases/admin/admin");
const admin_3 = require("../../infrastructure/repositories/admin/admin");
const adminauth_1 = require("../../shared/middlewares/adminauth");
const express_session_1 = __importDefault(require("express-session"));
const router = (0, express_1.Router)();
// Session handling
router.use((0, express_session_1.default)({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));
const repository = new admin_3.adminRepository();
const useCase = new admin_2.adminUseCase(repository);
const controller = new admin_1.adminController(useCase);
// // Public route for admin login
router.get("/b", controller.b.bind(controller));
router.post("/adminLogin", controller.adminLogin.bind(controller));
router.get("/checkSession", controller.checkSession.bind(controller));
router.get("/session-exists", controller.isSessionExist.bind(controller));
router.post("/adminLogout", controller.adminLogout.bind(controller));
router.post("/loginpost", controller.loginpost.bind(controller));
router.use(adminauth_1.adminAuth);
router.get("/details", controller.getAdminDetails.bind(controller));
router.get("/downloadReport", controller.downloadReport.bind(controller));
router.get("/getRevenue", controller.getRevenue.bind(controller));
router.get("/getTempPerformers", controller.allTempPerformers.bind(controller));
router.post("/grant-performer-permission/:userId", controller.grandedPermission.bind(controller));
router.post("/reject-performer-permission/:id", controller.rejectedPermission.bind(controller));
router.get("/performers", controller.getAllPerformers.bind(controller));
router.post("/updatePerformerStatus/:id", controller.blockunblockperformer.bind(controller));
router.get("/getUsers", controller.allUsers.bind(controller));
router.post("/updateUserStatus/:id", controller.blockunblockuser.bind(controller));
router.get("/getAllEvents", controller.getAllEvents.bind(controller));
router.post("/blockUnblockEvents/:id", controller.toggleBlockStatus.bind(controller));
exports.default = router;
