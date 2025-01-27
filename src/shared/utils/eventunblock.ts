import { EventModel } from './../../infrastructure/models/eventsModel';


export const unblockExpiredEvents = async (): Promise<void> => {
    try {
console.log('unblock')
      const eventsToUnblock = await EventModel.find({
        isblocked: true,
        blockingPeriod: { $lt: new Date() }
      });
  
      // Unblock events
      const unblockedEvents = await Promise.all(
        eventsToUnblock.map(async (event) => {
          event.isblocked = false;
          event.blockingReason = '';
          event.blockingPeriod = null;
          return await event.save();
        })
      );
  
  
    } catch (error) {
      console.error("Error unblocking expired events:", error);
      throw error;
    }
  };