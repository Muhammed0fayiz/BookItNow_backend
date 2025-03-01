"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user/user");
const user_2 = require("../../infrastructure/repositories/user/user");
const user_3 = require("../../application/useCases/user/user");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const authMiddleware_1 = __importDefault(require("../../shared/middlewares/authMiddleware"));
const router = (0, express_1.Router)();
const repository = new user_2.userRepository();
const useCase = new user_3.userUseCase(repository);
const controller = new user_1.UserController(useCase);
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../../../../frontend/public/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage: storage });
router.post("/login", controller.userLogin.bind(controller));
router.post("/signup", controller.userSignup.bind(controller));
router.post("/verify-otp", controller.checkOtp.bind(controller));
router.post("/resend-otp/:email", controller.resendOtp.bind(controller));
router.get("/auth/google", (req, res, next) => {
    passport_1.default.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
router.get("/auth/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "http://localhost:3000",
}), controller.googleCallback.bind(controller));
router.get("/getWalletHistory/:id", authMiddleware_1.default, controller.walletHistory.bind(controller));
router.get("/getUser/:id", controller.getUserDetails.bind(controller));
router.put("/updateUserProfile/:id", upload.single("profilePic"), controller.updateUserProfile.bind(controller));
router.put("/changePassword/:id", authMiddleware_1.default, controller.changePassword.bind(controller));
exports.default = router;
