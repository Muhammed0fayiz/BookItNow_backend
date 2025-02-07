import { Router } from "express";
import { performerEventRepository } from "../../infrastructure/repositories/performer/event";
import { performerEventUseCase } from "../../application/useCases/performer/event";
import authMiddleware from "../../shared/middlewares/authMiddleware";
import { performerEventController } from "../controllers/performer/event";



const router = Router();
const repository = new performerEventRepository();
const useCase = new performerEventUseCase(repository);
const controller = new performerEventController(useCase);



router.post("/uploadEvents/:id",authMiddleware,controller.uploadEvents.bind(controller));
router.put("/editEvent/:id/:eid",authMiddleware,controller.editEvents.bind(controller));
router.get("/getPerformerEvents/:id",authMiddleware,controller.getPerformerEvents.bind(controller));
router.delete("/deleteEvent/:id",authMiddleware,controller.deleteEvent.bind(controller));
router.put("/blockUnblockEvents/:id",authMiddleware,controller.toggleBlockStatus.bind(controller));
router.get("/upcomingevents/:id",authMiddleware,controller.upcomingEvents.bind(controller));
router.post("/cancelEvent/:id",authMiddleware,controller.cancelEventByPerformer.bind(controller));
router.get("/eventhistory/:id",authMiddleware,controller.eventHistory.bind(controller));
router.put("/changeEventStatus",authMiddleware,controller.changeEventStatus.bind(controller));
router.get("/performerUpcomingEvents/:id",authMiddleware,controller.getUpcomingEvents.bind(controller));
router.get("/getEvent/:id", controller.getEvent.bind(controller));
router.post( "/appealBlockedEvent/:id/:email",controller.appealBlockedEvent.bind(controller)
);

export default router;
