import { Router } from "express";
import { UserController } from "../controllers/user/user";
import { userRepository } from "../../infrastructure/repositories/user/user";
import { userUseCase } from "../../application/useCases/user/user";
import authenticateJWT from "../../shared/middlewares/authentication";

import { performerRepository } from "../../infrastructure/repositories/performer/performer";
import { performerUseCase } from "../../application/useCases/performer/performer";
import { performerController } from "../controllers/performer/performer";
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

router.post("/performerlogin", controller.performerLogin.bind(controller));
router.post(
  "/tempPerformer",
  upload.single("video"),
  authMiddleware,
  controller.addTempPerformer.bind(controller)
);
router.get(
  "/getPerformer/:id",
  authMiddleware,
  controller.getPerformerDetails.bind(controller)
);
router.get(
  "/downloadReport/:id",
  authMiddleware,
  controller.downloadReport.bind(controller)
);
router.put(
  "/updatePerformerProfile/:id",
  uploads.single("image"),
  authMiddleware,
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
