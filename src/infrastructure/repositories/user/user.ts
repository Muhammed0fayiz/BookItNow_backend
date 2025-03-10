
import { TempPerformerDocument } from "../../models/tempPerformer";
import { IuserRepository } from "../../../application/interfaces/user/repositary/user";
import { User, UserDocument } from "../../../domain/entities/user";
import { OtpUser } from "../../../domain/entities/otpUser";
import { UserDocuments, UserModel } from "../../models/userModel";
import bcrypt from "bcrypt";
import { TempPerformerModel } from "../../models/tempPerformer";
import { tempUserModel } from "../../models/tempUser";
import { PerformerModel } from "../../models/performerModel";
import { Performer } from "../../../domain/entities/performer";
import { WalletDocument, WalletModel } from "../../models/walletHistory";
import mongoose from "mongoose";
export class userRepository implements IuserRepository {
  updatedprofile=async(userId: mongoose.Types.ObjectId, username: string, profilePicUrl: string | null): Promise<UserDocuments>=> {
    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
  
      user.username = username;
  
      if (profilePicUrl) {
        user.profileImage = profilePicUrl;
      }
  
      await user.save(); // Save the changes to the database
      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  getUserDetails = async (id: mongoose.Types.ObjectId): Promise<UserDocuments | null> => {
    try {
      const user = await UserModel.findById(id).lean().exec();

      if (!user) throw new Error("User not found");
      return user ? user : null;
    } catch (error) {
      console.error("error occured",error);
      return null;
    }
  };
  updateUserPassword = async (
    id: mongoose.Types.ObjectId,
    newPassword: string
  ): Promise<UserDocuments | null> => {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  };
  walletHistory = async (
    objectId: mongoose.Types.ObjectId
  ): Promise<WalletDocument[] | null> => {
    try {
      const userWallet = await WalletModel.find({ userId: objectId }).sort({
        _id: -1,
      });

      return userWallet;
    } catch (error) {
      throw error;
    }
  };
  resendOtp = async (email: string, otp: string): Promise<User | null> => {
    try {
       await tempUserModel.findOne({ email });
      // Making the email case-insensitive
      const m = await tempUserModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      });

      if (!m) {
        throw new Error("User not found");
      }

      // Update OTP
      const result = await tempUserModel.findOneAndUpdate(
        { email: m.email },
        { otp: otp }, // Use the provided otp
        { new: true }
      );

      return result as unknown as User | null;
    } catch (error) {
      throw error;
    }
  };
  getTempPerformer = async (): Promise<TempPerformerDocument[] | null> => {
    try {
      const tmp = await TempPerformerModel.find();
      if (tmp) {
        return tmp;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };
  loginUser = async (
    email: string,
    password: string
  ): Promise<User | null | string> => {
    try {
      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return null;
      } else if (user.isblocked) {
        return "User Is Blocked";
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return null;
      }

      return {
        username: user.username,
        email: user.email,
        password: user.password,
        _id: user._id?.toString(),
        isVerified: user.isVerified,
        isblocked: user.isblocked,
      };
    } catch (error) {
      throw error;
    }
  };
  tempUserExist = async (email: string): Promise<OtpUser | null> => {
    try {
      const tempUser = await tempUserModel.findOne({ email: email });
      if (!tempUser) {
        return null;
      }
      return new OtpUser(
        tempUser.username,
        tempUser.email,
        tempUser.password,
        tempUser._id?.toString(),
        tempUser.otp
      );
    } catch (error) {
      console.error("Error finding temp user:", error);
      throw error;
    }
  };
  checkOtp = async (user: {
    email: string;
    otp: string;
    password: string;
    username: string;
  }): Promise<User | null> => {
    try {
      const otpUser = await tempUserModel.findOne({
        email: user.email,
        otp: user.otp,
      });

      if (otpUser !== null) {
        const insertedUser = await this.insertUser(
          otpUser.email,
          otpUser.password,
          otpUser.username
        );

        if (insertedUser) {
          await tempUserModel.deleteOne({ email: user.email, otp: user.otp });
        }

        return insertedUser;
      }

      return null;
    } catch (error) {
      throw error;
    }
  };
  insertUser = async (
    email: string,
    password: string,
    username: string
  ): Promise<User | null> => {
    try {
      const user = {
        email: email,
        password: password,
        username: username,
        isVerified: false,
        isblocked: false,
      };

      const userData = await UserModel.insertMany([user]);

      if (userData && userData.length > 0) {
        const insertedUser = userData[0].toObject() as unknown as UserDocument;
        return new User(
          insertedUser.username,
          insertedUser.email,
          insertedUser.password,
          insertedUser.isVerified,
          insertedUser.isblocked
        );
      }

      return null;
    } catch (error) {
      throw error;
    }
  };
  OtpUser = async (
    mail: string,
    otp: string,
    password: string,
    username: string
  ): Promise<OtpUser | null> => {
    try {
      const otpUser = {
        email: mail,
        otp: otp,
        username: username,
        password: password,
      };

      const tempUserData = await tempUserModel.insertMany([otpUser]);

      if (tempUserData && tempUserData.length > 0) {
        return new OtpUser(
          otpUser.email,
          otpUser.otp,
          otpUser.password,
          otpUser.username
        );
      }

      return null;
    } catch (error) {
      throw error;
    }
  };
  userExist = async (email: string): Promise<User | null> => {
    try {
      const user = await UserModel.findOne({ email: email });

      if (!user) {
        return null;
      }
      return new User(
        user.username,
        user.email,
        user.password,
        user.isVerified,
        user.isblocked,
        user._id?.toString()
      );
    } catch (error) {
      throw error;
    }
  };
  getAllPerformer = async (
    id: mongoose.Types.ObjectId
  ): Promise<Performer[] | null> => {
    try {
      const performers = await PerformerModel.find({ userId: { $ne: id } });

      return performers;
    } catch (error) {
      throw error;
    }
  };

}
