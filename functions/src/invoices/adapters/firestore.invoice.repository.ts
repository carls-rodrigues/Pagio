import { db } from "../../shared/firebase-admin";
import type { InvoiceRepository } from "../ports/invoice.repository";
import type { Invoice } from "../domain/invoice";

export class FirestoreInvoiceRepository implements InvoiceRepository {
  private collection(organizationId: string) {
    return db.collection("organizations").doc(organizationId).collection("invoices");
  }

  async save(invoice: Invoice): Promise<void> {
    const ref = this.collection(invoice.organizationId).doc(invoice.id);
    await ref.set(invoice, { merge: true });
  }

  async findById(id: string, organizationId: string): Promise<Invoice | null> {
    const doc = await this.collection(organizationId).doc(id).get();
    return doc.exists ? (doc.data() as Invoice) : null;
  }

  async findByVendor(vendorId: string, organizationId: string, limit = 20): Promise<Invoice[]> {
    const snap = await this.collection(organizationId)
      .where("vendorId", "==", vendorId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as Invoice);
  }
}
