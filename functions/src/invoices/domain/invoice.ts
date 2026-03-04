import type { Invoice, InvoiceStatus, LineItem, Timestamp } from "@pagio/shared";

export type { Invoice, InvoiceStatus, LineItem };

export interface CreateInvoiceInput {
  organizationId: string;
  vendorId: string;
  fileUrl: string;
}

export function createInvoice(input: CreateInvoiceInput, now: Timestamp): Invoice {
  return {
    id: "",
    organizationId: input.organizationId,
    vendorId: input.vendorId,
    fileUrl: input.fileUrl,
    status: "pending",
    amount: 0,
    dueDate: now,
    lineItems: [],
    aiSummary: "",
    aiRecommendation: null,
    isAnomalous: false,
    anomalyReason: null,
    extractedFields: {},
    rejectionReason: null,
    paidAt: null,
    approvedAt: null,
    approvedBy: null,
    createdAt: now,
    updatedAt: now,
  };
}
