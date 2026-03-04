import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { storage } from "@/lib/firebase/storage";
import { firebaseApp } from "@/lib/firebase/client";

interface UseInvoiceUploadOptions {
  organizationId: string;
  userId: string;
}

export function useInvoiceUpload({ organizationId }: UseInvoiceUploadOptions) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(vendorId: string, file: File): Promise<string> {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const db = getFirestore(firebaseApp);
      const invoiceRef = doc(collection(db, "organizations", organizationId, "invoices"));
      const invoiceId = invoiceRef.id;

      const storageRef = ref(
        storage,
        `organizations/${organizationId}/invoices/${invoiceId}/${file.name}`
      );

      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on(
          "state_changed",
          (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
          reject,
          resolve
        );
      });

      const fileUrl = await getDownloadURL(storageRef);
      const now = Timestamp.now();

      await setDoc(invoiceRef, {
        id: invoiceId,
        organizationId,
        vendorId,
        fileUrl,
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
      });

      return invoiceId;
    } catch (err) {
      setError("Upload failed. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { upload, loading, progress, error };
}
