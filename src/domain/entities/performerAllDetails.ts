export interface performerAllDetails {
    walletAmount: number | null;
    walletTransactionHistory: Record<string, number>;
    totalEvent: number | null;
    totalPrograms: number | null;
    totalEventsHistory: Record<string, number>;
    upcomingEvents: Record<string, number>;
    totalReviews: number;
  }