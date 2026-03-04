import { Vendor } from "@pagio/shared";

interface VendorDetailProps {
  vendor: Vendor;
}

export function VendorDetail({ vendor }: VendorDetailProps) {
  return (
    <section aria-label="Vendor details">
      <h2>{vendor.name}</h2>
      <dl>
        <dt>Email</dt>
        <dd>{vendor.email}</dd>
        <dt>Tax ID</dt>
        <dd>{vendor.taxId}</dd>
      </dl>
    </section>
  );
}
