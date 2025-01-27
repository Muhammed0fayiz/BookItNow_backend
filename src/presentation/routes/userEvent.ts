import { Router } from "express";
import { UserEventController } from "../controllers/user/event";
// import { Event } from "../../infrastructure/repositories/user/event";

import { userEventUseCase } from "../../application/useCases/user/event";
import authenticateJWT from "../../shared/middlewares/authentication";
import multer from "multer";
import path from "path";
import passport from "passport";
import authMiddleware from "../../shared/middlewares/authMiddleware";
import { userEventRepository } from "../../infrastructure/repositories/user/event";

const router = Router();

const repository = new userEventRepository();
const useCase = new userEventUseCase(repository);
const controller = new UserEventController(useCase);

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

const upload = multer({ storage: storage });

router.get(
  "/getAllEvents/:id",
  authMiddleware,
  controller.getAllEvents.bind(controller)
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
  "/userUpcomingEvents/:id",
  authMiddleware,
  controller.getUpcomingEvents.bind(controller)
);
router.get(
  "/eventhistory/:id",
  authMiddleware,
  controller.eventHistory.bind(controller)
);
router.get(
  "/userEventHistory/:id",
  authMiddleware,
  controller.getEventHistory.bind(controller)
);
router.get(
  "/getFilteredEvents/:userId",
  authMiddleware,
  controller.getFilteredEvents.bind(controller)
);
router.post(
  "/add-rating/:id",
  authMiddleware,
  controller.addRating.bind(controller)
);
router.get(
  "/eventrating/:id",
  authMiddleware,
  controller.getEventRating.bind(controller)
);

router.get(
  "/favorites/:id",
  authMiddleware,
  controller.getFavoriteEvents.bind(controller)
);
router.post(
  "/toggleFavoriteEvent/:userId/:eventId",
  authMiddleware,
  controller.toggleFavoriteEvent.bind(controller)
);
router.post(
  "/walletPayment",
  authMiddleware,
  controller.walletPayment.bind(controller)
);
//debug
router.post("/ed/:id", controller.updateBookingDate.bind(controller));

router.get(
  "/getperformers/:id",
  authMiddleware,
  controller.getAllPerformers.bind(controller)
);
router.post(
  "/checkavailable",
  authMiddleware,
  controller.availableDate.bind(controller)
);
router.get(
  "/getFilteredPerformers/:userId",
  authMiddleware,
  controller.getFilteredPerformers.bind(controller)
);
router.get(
  "/top-rated-event/:id",
  authMiddleware,
  controller.getTopRatedEvent.bind(controller)
);

export default router;
