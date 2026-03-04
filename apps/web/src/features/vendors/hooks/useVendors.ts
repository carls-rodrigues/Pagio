"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/client";
import { Vendor } from "@pagio/shared";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function useVendors() {
  const organizationId = useAuthStore((s) => s.organizationId);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    const db = getFirestore(firebaseApp);
    const q = query(collection(db, "vendors"), where("organizationId", "==", organizationId));

    const unsubscribe = onSnapshot(q, (snap) => {
      setVendors(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Vendor));
      setLoading(false);
    });

    return unsubscribe;
  }, [organizationId]);

  return { vendors, loading };
}
