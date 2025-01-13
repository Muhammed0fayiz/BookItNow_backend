import { Router } from "express";
import { UserController } from "../controllers/userController";
import { userRepository } from "../../infrastructure/repositories/user";
import { userUseCase } from "../../application/useCases/user";
import authenticateJWT from "../../shared/middlewares/authentication";
import { performerRepository } from "../../infrastructure/repositories/performer";
import { performerUseCase } from "../../application/useCases/performer";
import { performerController } from "../controllers/performerController";
import path from "path";
import multer from "multer";
import authMiddleware from "../../shared/middlewares/authMiddleware";

const upload = multer();

const router = Router();

const repository = new performerRepository();

const useCase = new performerUseCase(repository);

const controller = new performerController(useCase);

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

const uploads = multer({ storage: storage });

router.post(
  "/tempPerformer",
  upload.single("video"),
  controller.addTempPerformer.bind(controller)
);
router.post("/performerlogin", controller.performerLogin.bind(controller));
router.get(
  "/getPerformer/:id",
  controller.getPerformerDetails.bind(controller)
);
router.get("/downloadReport/:id", controller.downloadReport.bind(controller));
router.put(
  "/updatePerformerProfile/:id",
  uploads.single("image"),
  controller.updatePerformerProfile.bind(controller)
);
router.get(
  "/performerAllDetails/:id",
  authMiddleware,
  controller.performerAllDetails.bind(controller)
);
router.get(
  "/getusers/:id",
  authMiddleware,
  controller.getAllUsers.bind(controller)
);

router.post("/uploadEvents/:id", controller.uploadEvents.bind(controller));
router.put(
  "/editEvents/:id/:eid",
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

router.post(
  "/updateSlotStatus/:id",
  authMiddleware,
  controller.updateSlotStatus.bind(controller)
);
router.get(
  "/getslot/:id",
  authMiddleware,
  controller.getslotDetails.bind(controller)
);

export default router;
