"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useVendors } from "@/features/vendors/hooks/useVendors";
import { uploadSchema } from "../schemas/upload.schema";
import { useInvoiceUpload } from "../hooks/useInvoiceUpload";

interface InvoiceUploadFormProps {
  onSuccess?: (invoiceId: string) => void;
}

export function InvoiceUploadForm({ onSuccess }: InvoiceUploadFormProps) {
  const user = useAuthStore((s) => s.user);
  const organizationId = useAuthStore((s) => s.organizationId);
  const { vendors, loading: vendorsLoading } = useVendors();
  const {
    upload,
    loading,
    progress,
    error: uploadError,
  } = useInvoiceUpload({
    organizationId: organizationId ?? "",
    userId: user?.uid ?? "",
  });

  const [vendorId, setVendorId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ vendorId?: string; file?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = uploadSchema.safeParse({ vendorId, file });
    if (!result.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof typeof errors;
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    try {
      const invoiceId = await upload(vendorId, result.data.file);
      setVendorId("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess?.(invoiceId);
    } catch {
      // error is set by the hook
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Upload invoice">
      <div>
        <label htmlFor="vendor">Vendor</label>
        <select
          id="vendor"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          disabled={vendorsLoading || loading}
          aria-required="true"
        >
          <option value="">Select a vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {fieldErrors.vendorId && <p>{fieldErrors.vendorId}</p>}
      </div>

      <div>
        <label htmlFor="file">Invoice file</label>
        <input
          ref={fileInputRef}
          id="file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={loading}
          aria-required="true"
        />
        {fieldErrors.file && <p>{fieldErrors.file}</p>}
      </div>

      {uploadError && <p>{uploadError}</p>}

      {loading && (
        <div>
          <progress value={progress} max={100} aria-label="Upload progress" />
          <span>{Math.round(progress)}%</span>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload invoice"}
      </button>
    </form>
  );
}
