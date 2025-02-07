import { Types } from "mongoose";

export interface IEventPayload {
    imageUrl: string;
    title: string;
    category: string;
    userId: Types.ObjectId;
    price: number;
    teamLeader: string;
    teamLeaderNumber: number;
    description: string;
  }