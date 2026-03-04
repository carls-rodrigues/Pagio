import { Vendor } from "@pagio/shared";

interface VendorListProps {
  vendors: Vendor[];
  loading: boolean;
  onSelect?: (vendor: Vendor) => void;
  selectedId?: string;
}

export function VendorList({ vendors, loading, onSelect, selectedId }: VendorListProps) {
  if (loading) return <p>Loading vendors...</p>;
  if (vendors.length === 0) return <p>No vendors yet.</p>;

  return (
    <ul>
      {vendors.map((vendor) => (
        <li key={vendor.id}>
          <button
            onClick={() => onSelect?.(vendor)}
            aria-current={selectedId === vendor.id ? "true" : undefined}
          >
            <span>{vendor.name}</span>
            <span>{vendor.email}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
