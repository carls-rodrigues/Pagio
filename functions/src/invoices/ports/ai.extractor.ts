import type { Invoice } from "../domain/invoice";

export interface ExtractedInvoice {
  amount: number;
  dueDate: string; // ISO datetime
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  aiSummary: string;
  extractedFields: Record<string, boolean>;
}

export interface AIExtractor {
  extract(fileUrl: string, invoice: Invoice): Promise<ExtractedInvoice>;
}
