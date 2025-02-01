import { Router } from "express";
import { UserController } from "../controllers/user/user";
import { userRepository } from "../../infrastructure/repositories/user/user";
import { userUseCase } from "../../application/useCases/user/user";
import authenticateJWT from "../../shared/middlewares/authentication";

import { performerEventRepository } from "../../infrastructure/repositories/performer/event";
import { performerEventUseCase } from "../../application/useCases/performer/event";
import { performerController } from "../controllers/performer/performer";
import path from "path";
import multer from "multer";
import authMiddleware from "../../shared/middlewares/authMiddleware";
import { performerEventController } from "../controllers/performer/event";

const upload = multer();

const router = Router();

const repository = new performerEventRepository();

const useCase = new performerEventUseCase(repository);

const controller = new performerEventController(useCase);

router.post(
  "/uploadEvents/:id",
  authMiddleware,
  controller.uploadEvents.bind(controller)
);
router.put(
  "/editEvent/:id/:eid",
  authMiddleware,
  controller.editEvents.bind(controller)
);
router.get(
  "/getPerformerEvents/:id",
  authMiddleware,
  controller.getPerformerEvents.bind(controller)
);
router.delete(
  "/deleteEvent/:id",
  authMiddleware,
  controller.deleteEvent.bind(controller)
);
router.put(
  "/blockUnblockEvents/:id",
  authMiddleware,
  controller.toggleBlockStatus.bind(controller)
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
  "/eventhistory/:id",
  authMiddleware,
  controller.eventHistory.bind(controller)
);
router.put(
  "/changeEventStatus",
  authMiddleware,
  controller.changeEventStatus.bind(controller)
);
router.get(
  "/performerUpcomingEvents/:id",
  authMiddleware,
  controller.getUpcomingEvents.bind(controller)
);

router.get("/getEvent/:id", controller.getEvent.bind(controller));
router.post(
  "/appealBlockedEvent/:id/:email",
  controller.appealBlockedEvent.bind(controller)
);

export default router;
