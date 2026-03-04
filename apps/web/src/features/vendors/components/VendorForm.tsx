"use client";

import { useState } from "react";
import { createVendorSchema } from "../schemas/vendor.schema";
import { useCreateVendor } from "../hooks/useCreateVendor";

type FieldErrors = { name?: string; email?: string; taxId?: string };

interface VendorFormProps {
  onSuccess?: () => void;
}

export function VendorForm({ onSuccess }: VendorFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { createVendor, loading, error: serverError } = useCreateVendor();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = createVendorSchema.safeParse({ name, email, taxId });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    const id = await createVendor(result.data);
    if (id) {
      setName("");
      setEmail("");
      setTaxId("");
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="vendor-name">Name</label>
        <input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} />
        {fieldErrors.name && <p role="alert">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="vendor-email">Email</label>
        <input
          id="vendor-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && <p role="alert">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="vendor-taxId">Tax ID</label>
        <input id="vendor-taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        {fieldErrors.taxId && <p role="alert">{fieldErrors.taxId}</p>}
      </div>

      {serverError && <p role="alert">{serverError}</p>}

      <button type="submit" disabled={loading}>
        Add Vendor
      </button>
    </form>
  );
}
