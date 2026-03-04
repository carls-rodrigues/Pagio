import { onDocumentUpdated } from "firebase-functions/v2/firestore";

// Full implementation: S-10 (send notification on status change)
export const onInvoiceStatusChange = onDocumentUpdated(
  "organizations/{organizationId}/invoices/{invoiceId}",
  async (_event) => {
    // TODO S-10: detect status field change, send notification
  }
);
