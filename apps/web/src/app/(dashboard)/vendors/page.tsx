"use client";

import { useState } from "react";
import { Vendor } from "@pagio/shared";
import { VendorForm } from "@/features/vendors/components/VendorForm";
import { VendorList } from "@/features/vendors/components/VendorList";
import { VendorDetail } from "@/features/vendors/components/VendorDetail";
import { useVendors } from "@/features/vendors/hooks/useVendors";

export default function VendorsPage() {
  const { vendors, loading } = useVendors();
  const [selected, setSelected] = useState<Vendor | null>(null);

  return (
    <main>
      <h1>Vendors</h1>
      <VendorForm onSuccess={() => setSelected(null)} />
      <VendorList
        vendors={vendors}
        loading={loading}
        onSelect={setSelected}
        selectedId={selected?.id}
      />
      {selected && <VendorDetail vendor={selected} />}
    </main>
  );
}
