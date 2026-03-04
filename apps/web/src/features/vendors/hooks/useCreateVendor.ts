"use client";

import { useState } from "react";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CreateVendorInput } from "../schemas/vendor.schema";

export function useCreateVendor() {
  const organizationId = useAuthStore((s) => s.organizationId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createVendor(input: CreateVendorInput): Promise<string | null> {
    if (!organizationId) throw new Error("Not authenticated");

    setLoading(true);
    setError(null);

    try {
      const db = getFirestore(firebaseApp);

      const existing = await getDocs(
        query(
          collection(db, "vendors"),
          where("organizationId", "==", organizationId),
          where("taxId", "==", input.taxId)
        )
      );

      if (!existing.empty) {
        setError("A vendor with this Tax ID already exists.");
        return null;
      }

      const docRef = await addDoc(collection(db, "vendors"), {
        ...input,
        organizationId,
      });

      return docRef.id;
    } catch {
      setError("Something went wrong. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { createVendor, loading, error };
}
