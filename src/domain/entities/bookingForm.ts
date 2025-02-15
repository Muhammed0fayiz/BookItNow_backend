import mongoose from "mongoose";

 export interface BookingForm {
    place: string;
    date: string; 
    time: string; 
  }
  

  export interface SortOptions {
    [key: string]: 1 | -1;
  }
  export interface FilterOptions {
    search?: string;
    $or?: Array<{
      bandName?: { $regex: string; $options: string };
      place?: { $regex: string; $options: string };
    }>;
  }
    


 export  interface CombinedFilter {
    userId: {
      $ne: mongoose.Types.ObjectId;
      $nin: mongoose.Types.ObjectId[];
    };
    $or?: { [key: string]: { $regex: string; $options: string } }[];
  }