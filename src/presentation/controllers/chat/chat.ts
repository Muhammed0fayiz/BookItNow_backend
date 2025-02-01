import { Response, Request, NextFunction } from "express";

import { IChatUseCase } from "../../../application/interfaces/chat/IchatUseCase";
import { ResponseStatus } from "../../../constants/responseStatus";
import mongoose, { Types } from "mongoose";
import { MessageConstants } from "../../../shared/utils/constant";

export class ChatController {
  private _useCase: IChatUseCase;

  constructor(private useCase: IChatUseCase) {
    this._useCase = useCase;
  }

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sender, receiver } = req.params;
      const senderId = new mongoose.Types.ObjectId(sender);
      const receiverId = new mongoose.Types.ObjectId(receiver);
      const { message } = req.body;
      if (!message) {
        return res.status(ResponseStatus.BadRequest).json({ error: "Message is required" });
      }
      const sentMessage = await this._useCase.sendMessage(
        senderId,
        receiverId,
        message
      );
      return res
        .status(ResponseStatus.OK)
        .json({ message: MessageConstants.MESSAGE_SENT_SUCCESS, data: sentMessage });
    } catch (error) {
      console.error("Error in sendMessage:", error);
      next(error);
    }
  };
  chatWithPerformer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userid, performerid } = req.params;
      const userId = new mongoose.Types.ObjectId(userid);
      const performerId = new mongoose.Types.ObjectId(performerid);
      const performerMessage = await this._useCase.chatWithPerformer(
        userId,
        performerId
      );
      res.status(ResponseStatus.OK).json({
        success: true,
        message: MessageConstants.MESSAGE_SENT_SUCCESS,
        data: performerMessage,
      });
    } catch (error) {
      console.error("Error in chatWithPerformer:", error);
      next(error);
    }
  };
  chatWith = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { myId, anotherId } = req.params;
      const myIdObject = new mongoose.Types.ObjectId(myId);
      const anotherIdObject = new mongoose.Types.ObjectId(anotherId);
      const chatting = await this._useCase.ChatWith(
        myIdObject,
        anotherIdObject
      );
      res
        .status(ResponseStatus.OK)
        .json({ message: MessageConstants.CHAT_FETCH_SUCCESS, data: chatting });
    } catch (error) {
      // Handle errors
      console.error(error);
      next(error);
    }
  };
  getAllChatRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const {id}=req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(ResponseStatus.BadRequest).json({ error: "Invalid user ID" });
      }
      const userId = new mongoose.Types.ObjectId(id);
      const allRooms = await this._useCase.getAllChatRooms(userId);
      return res.status(ResponseStatus.OK).json({ success: true, data: allRooms });
    } catch (error) {
      next(error);
    }
  };
  onlineUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, anotherId } = req.params;
      const uId = new mongoose.Types.ObjectId(userId);
      const pId = new mongoose.Types.ObjectId(anotherId);
      const result = await this._useCase.onlineUser(uId, pId);
      if (result) {
        return res
          .status(ResponseStatus.OK)
          .json({ message: MessageConstants.USER_STATUS_UPDATED, data: result });
      } else {
        return res.status(ResponseStatus.NotFound).json({ message: "User not found." });
      }
    } catch (error) {
      throw error;
    }
  };
  offlineUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = new mongoose.Types.ObjectId(id);
      const result = await this._useCase.offlineUser(userId);
      if (result) {
        return res
          .status(ResponseStatus.OK)
          .json({ message: MessageConstants.USER_STATUS_UPDATED, data: result });
      } else {
        return res.status(ResponseStatus.NotFound).json({ message: "User not found." });
      }
    } catch (error) {
      throw error;
    }
  };
  getMessgeNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const userId = new mongoose.Types.ObjectId(id);
      const messageNotification = await this._useCase.getMessageNotification(
        userId
      );
      res.status(ResponseStatus.OK).json({ success: true, data: messageNotification });
    } catch (error) {
      next(error);
    }
  };
  checkOnlineUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, otherId } = req.params;
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(otherId)
      ) {
        return res.status(ResponseStatus.BadRequest).json({ message: "Invalid user ID or other ID" });
      }
      console.log(userId, "dd", otherId);
      const oId = new mongoose.Types.ObjectId(otherId);
      const id = new mongoose.Types.ObjectId(userId);
      const onlineUser = await this._useCase.CheckOnline(id, oId);
      console.log(onlineUser);
      return res.status(ResponseStatus.OK).json({ onlineUser });
    } catch (error) {
      console.error("Error in checkOnlineUser:", error);
      return res.status(500).json({ message: MessageConstants.ERROR_OCCURRED });
    }
  };
}
