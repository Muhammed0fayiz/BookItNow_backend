import { Router } from "express";
import { UserController } from "../controllers/userController";
import { userRepository } from "../../infrastructure/repositories/user";
import { userUseCase } from "../../application/useCases/user";
import authenticateJWT from "../../shared/middlewares/authentication";
import { performerRepository } from "../../infrastructure/repositories/performer";
import { performerUseCase } from "../../application/useCases/performer";
import { performerController } from "../controllers/performerController";
import multer from "multer";

const upload = multer();

const router = Router();

const repository = new performerRepository();

const useCase = new performerUseCase(repository);

const controller = new performerController(useCase);

router.get("/getPerfomer/:id", controller.getPerformerDetails.bind(controller));
router.post(
  "/tempPerformer",
  upload.single("video"),
  controller.addTempPerformer.bind(controller)
);

router.post("/performerlogin", controller.performerLogin.bind(controller));

export default router;
