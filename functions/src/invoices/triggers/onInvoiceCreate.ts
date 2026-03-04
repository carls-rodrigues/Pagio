import { onDocumentCreated } from "firebase-functions/v2/firestore";

// Pipeline: extraction → anomaly detection → recommendation
// Full implementation: S-05, S-12, S-13
export const onInvoiceCreate = onDocumentCreated(
  "organizations/{organizationId}/invoices/{invoiceId}",
  async (_event) => {
    // TODO S-05: trigger AI extraction pipeline
  }
);
