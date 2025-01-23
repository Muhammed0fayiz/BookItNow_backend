

// import { chatRepository } from './../../infrastructure/repositories/chat/chat';
import { Router } from "express";
import { ChatController } from "../controllers/chat/chat";


import { chatRepository} from "../../infrastructure/repositories/chat/chat";

import { chatUseCase } from "../../application/useCases/chat/chat";
import authenticateJWT from "../../shared/middlewares/authentication";
import multer from "multer";
import path from "path";
import passport from "passport";
import authMiddleware from "../../shared/middlewares/authMiddleware";
chatRepository

const router = Router();

const repository = new chatRepository();
const useCase = new chatUseCase(repository);
const controller = new ChatController(useCase);






router.post(
  "/handleSendMessage/:sender/:receiver",
  authMiddleware,
  
  controller.sendMessage.bind(controller)
);
router.post(
  "/chatWithPerformer/:userid/:performerid",
  controller.chatWithPerformer.bind(controller)
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
  "/onlineUser/:userId/:anotherId",
  authMiddleware,
  controller.onlineUser.bind(controller)
);
router.post(
  "/offlineUser/:id",
  authMiddleware,
  controller.offlineUser.bind(controller)
);
router.get(
  "/messageNotification/:id",
  controller.getMessgeNotification.bind(controller)
);
router.get(
  "/checkOnline/:userId/:otherId",
  authMiddleware,
  controller.checkOnlineUser.bind(controller)
);



export default router;
