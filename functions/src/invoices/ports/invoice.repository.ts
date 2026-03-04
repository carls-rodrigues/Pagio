import type { Invoice } from "../domain/invoice";

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
  findById(id: string, organizationId: string): Promise<Invoice | null>;
  findByVendor(vendorId: string, organizationId: string, limit?: number): Promise<Invoice[]>;
}
