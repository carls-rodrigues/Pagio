"use client";

import { useState } from "react";
import { InvoiceUploadForm } from "@/features/invoices/components/InvoiceUploadForm";

export default function InvoicesPage() {
  const [lastUploadedId, setLastUploadedId] = useState<string | null>(null);

  return (
    <main>
      <h1>Invoices</h1>
      {lastUploadedId && (
        <p role="status">
          Invoice uploaded — status: <strong>pending</strong>
        </p>
      )}
      <InvoiceUploadForm onSuccess={setLastUploadedId} />
    </main>
  );
}
