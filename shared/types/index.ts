// Shared Timestamp interface — compatible with both firebase/firestore and firebase-admin
// Adapters convert to/from this type at the boundary
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

export type InvoiceStatus =
  | "pending"
  | "extracted"
  | "extraction_failed"
  | "approved"
  | "rejected"
  | "paid";

export interface User {
  id: string;
  email: string;
  displayName: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export type MemberRole = "approver" | "viewer";

export interface OrganizationMember {
  userId: string;
  role: MemberRole;
  joinedAt: Timestamp;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  expiresAt: Timestamp;
  accepted: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  taxId: string;
  organizationId: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  vendorId: string;
  fileUrl: string;
  status: InvoiceStatus;
  amount: number;
  dueDate: Timestamp;
  lineItems: LineItem[];
  aiSummary: string;
  aiRecommendation: "approve" | "reject" | null;
  isAnomalous: boolean;
  anomalyReason: string | null;
  extractedFields: Record<string, boolean>;
  rejectionReason: string | null;
  paidAt: Timestamp | null;
  approvedAt: Timestamp | null;
  approvedBy: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  message: string;
  invoiceId: string;
  read: boolean;
  createdAt: Timestamp;
}
