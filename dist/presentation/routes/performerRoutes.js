"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performer_1 = require("../../infrastructure/repositories/performer/performer");
const performer_2 = require("../../application/useCases/performer/performer");
const performer_3 = require("../controllers/performer/performer");
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = __importDefault(require("../../shared/middlewares/authMiddleware"));
const upload = (0, multer_1.default)();
const router = (0, express_1.Router)();
const repository = new performer_1.performerRepository();
const useCase = new performer_2.performerUseCase(repository);
const controller = new performer_3.performerController(useCase);
const storage = multer_1.default.diskStorage({ destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../../../../frontend/public/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    }, });
const uploads = (0, multer_1.default)({ storage: storage });
router.post("/login", controller.performerLogin.bind(controller));
router.post("/tempPerformer", upload.single("video"), authMiddleware_1.default, controller.addTempPerformer.bind(controller));
router.get("/getPerformer/:id", authMiddleware_1.default, controller.getPerformerDetails.bind(controller));
router.get("/downloadReport/:id", authMiddleware_1.default, controller.downloadReport.bind(controller));
router.put("/updatePerformerProfile/:id", uploads.single("image"), authMiddleware_1.default, controller.updatePerformerProfile.bind(controller));
router.get("/performerAllDetails/:id", authMiddleware_1.default, controller.performerAllDetails.bind(controller));
router.get("/getusers/:id", authMiddleware_1.default, controller.getAllUsers.bind(controller));
router.post("/updateSlotStatus/:id", authMiddleware_1.default, controller.updateSlotStatus.bind(controller));
router.get("/getslot/:id", authMiddleware_1.default, controller.getslotDetails.bind(controller));
exports.default = router;
