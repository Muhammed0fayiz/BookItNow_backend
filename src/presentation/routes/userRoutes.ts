import { Router } from "express";
import { UserController } from "../controllers/userController";
import { userRepository } from "../../infrastructure/repositories/user";
import { userUseCase } from "../../application/useCases/user";
import authenticateJWT from "../../shared/middlewares/authentication";
import multer from "multer";
import path from "path";
import passport from "passport";
import authMiddleware from "../../shared/middlewares/authMiddleware";

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

// Authentication-related routes
router.post("/userlogin", controller.userLogin.bind(controller));
router.post("/signup", controller.userSignup.bind(controller));
router.post("/verify-otp", controller.checkOtp.bind(controller));
router.post("/resendotp/:email", controller.resendOtp.bind(controller));
router.get("/auth/google", (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login",
  }),
  controller.googleCallback.bind(controller)
);
// router.post("/chatwithPerformer/userid/performerid",controller.chatwithPerformer.bind(controller))
// Unprotected routes (no authMiddleware)
router.get("/getUser/:id", controller.getUserDetails.bind(controller));
router.put(
  "/updateUserProfile/:id",
  upload.single("profilePic"),
  controller.updateUserProfile.bind(controller)
);
router.put(
  "/changePassword/:id",
  authMiddleware,
  controller.changePassword.bind(controller)
);
router.get(
  "/getAllEvents/:id",
  authMiddleware,
  controller.getAllEvents.bind(controller)
);
router.get(
  "/getperformers/:id",
  authMiddleware,
  controller.getAllPerformers.bind(controller)
);
router.post(
  "/events/book",
  authMiddleware,
  controller.bookEvent.bind(controller)
);
router.get(
  "/upcomingevents/:id",
  authMiddleware,
  controller.upcomingEvents.bind(controller)
);
router.post(
  "/cancelevent/:id",
  authMiddleware,
  controller.cancelEventByUser.bind(controller)
);
router.get(
  "/getWalletHistory/:id",
  authMiddleware,
  controller.walletHistory.bind(controller)
);
router.post(
  "/handleSendMessage/:sender/:receiver",
  authMiddleware,
  controller.sendMessage.bind(controller)
);
router.post("/ed/:id", controller.updateBookingDate.bind(controller));
router.post(
  "/checkavailable",
  authMiddleware,
  controller.availableDate.bind(controller)
);
router.get(
  "/eventhistory/:id",
  authMiddleware,
  controller.eventHistory.bind(controller)
);
router.post(
  "/add-rating/:id",
  authMiddleware,
  controller.addRating.bind(controller)
);
router.post(
  "/walletPayment",
  authMiddleware,
  controller.walletPayment.bind(controller)
);
router.get(
  "/favorites/:id",
  authMiddleware,
  controller.getFavoriteEvents.bind(controller)
);
router.get(
  "/chat-with/:myId/:anotherId",
  authMiddleware,
  controller.chatWith.bind(controller)
);
router.get(
  "/chatrooms/:id",
  authMiddleware,
  controller.getAllChatRooms.bind(controller)
);
router.post(
  "/toggleFavoriteEvent/:userId/:eventId",
  authMiddleware,
  controller.toggleFavoriteEvent.bind(controller)
);
router.get(
  "/userUpcomingEvents/:id",
  authMiddleware,
  controller.getUpcomingEvents.bind(controller)
);

router.get(
  "/userEventHistory/:id",
  authMiddleware,
  controller.getEventHistory.bind(controller)
);

export default router;
