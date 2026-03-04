import { onSchedule } from "firebase-functions/v2/scheduler";

// Daily overdue invoice sweep — full implementation: S-16
export const onScheduledOverdueSweep = onSchedule("every 24 hours", async () => {
  // TODO S-16: query invoices past due date, create notifications
});
