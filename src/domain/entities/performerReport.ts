export interface PerformerReport {
   
    totalPrograms: number | null;

   
    upcomingEvent: Array<{
      title: string;
      date: Date;
      place: string;
      price: number;
      rating: number;
      teamLeadername:string
      teamLeaderNumber: string;
      category: string;
      status:string;
    }>;
    eventHistory: Array<{
      title: string;
      date: Date;
      place: string;
      price: number;
      rating: number;
      teamLeadername:string
      teamLeaderNumber: string;
      category: string;
      status:string;
    }>;
  }
  