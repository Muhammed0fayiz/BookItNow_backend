export interface AdminDetails {
    walletAmount: number | null;
    walletTransactionHistory: Record<string, number>;
    totalUsers: number | null;
    userRegistrationHistory: Record<string, number>;
    totalPerformers: number | null;
    performerRegistrationHistory: Record<string, number>;
  }
  
