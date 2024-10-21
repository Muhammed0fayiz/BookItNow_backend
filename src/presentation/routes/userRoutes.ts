
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { userRepository } from "../../infrastructure/repositories/user";
import { userUseCase } from "../../application/useCases/user";
import authenticateJWT from "../../shared/middlewares/authentication";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";

const router = Router();

const repository = new userRepository();
const useCase = new userUseCase(repository);
const controller = new UserController(useCase);

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../../frontend/public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

router.post("/userlogin", controller.userLogin.bind(controller));
router.post("/signup", controller.userSignup.bind(controller));
router.post("/verify-otp", controller.checkOtp.bind(controller));
router.get("/getUser/:id", controller.getUserDetails.bind(controller));
router.post("/resendotp/:email", controller.resendOtp.bind(controller));

router.put(
  "/updateUserProfile/:id",
  upload.single("profilePic"), // Ensure to use multer for file upload
  controller.updateUserProfile.bind(controller) // Bind the controller method
);

router.put("/changePassword/:id", controller.changePassword.bind(controller));

export default router;
