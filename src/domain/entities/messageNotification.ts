export interface MessageNotification {
    totalCount: number; 
    notifications: Array<{
        userId: string;
        numberOfMessages: number; 
    }>;
}
