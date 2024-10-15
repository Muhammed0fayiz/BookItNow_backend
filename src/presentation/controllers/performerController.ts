import { Response, Request, NextFunction } from "express";
import { isValidEmail } from "../../shared/utils/validEmail";
import { ResponseStatus } from "../../constants/responseStatus";
import { IuserUseCase } from "../../application/interfaces/IuserUseCase";
import { User } from "../../domain/entities/user";
import { isValidPassword } from "../../shared/utils/validPassword";
import { isValidFullName } from "../../shared/utils/validName";
import { generateOTP } from "../../shared/utils/generateOtp";
import { TempPerformer } from "../../domain/entities/tempPerformer";
import { TempPerformerModel } from "../../infrastructure/models/tempPerformer";
import { IperformerUseCase } from "../../application/interfaces/IperformerUseCase";
import { asPerformer } from "../../domain/entities/asPerformer";
import mongoose, { Types } from "mongoose";

export class performerController {
  private _useCase: IperformerUseCase;
   

  constructor(private useCase: IperformerUseCase) {
    this._useCase = useCase;
  }

 
  addTempPerformer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log(req.body, "body is ok");
      const { bandName, place, videoUrl, category, description, user_id } =
        req.body;

      // if (!bandName || !place || !videoUrl || !category || !description || !user_id) {
      //   return res.status(400).json({ message: 'All fields are required' });
      // }
      console.log(req.body, "body is ok");
      const newTempPerformer = new TempPerformerModel({
        bandName,
        place,
        videoUrl,
        category,
        description,
        user_id,
      });
      console.log(newTempPerformer, "is ok va");

      const savedTempPerformer = await newTempPerformer.save();
      res
        .status(201)
        .json({
          message: "Temp Performer added successfully",
          performer: savedTempPerformer,
        });
    } catch (error) {
      next(error);
    }
  };


  performerLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('prrrldsofd')
      if (!req.body) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "No Performer Data Provided" });
      }
  
      const performer = {
        email: req.body.email ? req.body.email.trim() : null,
        password: req.body.password ? req.body.password.trim() : null,
      };
  
      if (!performer.password || !performer.email) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Password or email is required" });
      }
  
      if (!isValidEmail(performer.email)) {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Invalid email format" });
      }
  
      const loginPerformer = await this._useCase.loginPerformer(
        performer.email,
        performer.password
      );
  
      if (loginPerformer) {
        const token = await this._useCase.jwt(loginPerformer as  asPerformer);
        res.status(ResponseStatus.Accepted).json({ token: token });
      } else {
        return res
          .status(ResponseStatus.BadRequest)
          .json({ message: "Performer not found or blocked/unverified" });
      }
    } catch (error) {
      console.log(error);
    }
  };


  getPerformerDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id = req.params.id;

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res
                .status(ResponseStatus.BadRequest)
                .json({ message: "Invalid user ID format" });
        }

        const objectId = new mongoose.Types.ObjectId(id); // Convert to ObjectId

        // Fetch performer details using userId
        const response = await this._useCase.getPerformerDetails(objectId);
        
        if (response) {
            return res
                .status(ResponseStatus.Accepted)
                .json({ message: "User Details Fetched Successfully", response });
        } else {
            return res
                .status(ResponseStatus.BadRequest)
                .json({ message: "User Details Fetch Failed" });
        }
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

  
}
