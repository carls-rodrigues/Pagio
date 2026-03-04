import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VendorDetail } from "../components/VendorDetail";
import { Vendor } from "@pagio/shared";

const mockVendor: Vendor = {
  id: "1",
  name: "Acme Corp",
  email: "billing@acme.com",
  taxId: "US123456789",
  organizationId: "org1",
};

describe("VendorDetail", () => {
  it("renders vendor name, email, and tax ID", () => {
    render(<VendorDetail vendor={mockVendor} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("billing@acme.com")).toBeInTheDocument();
    expect(screen.getByText("US123456789")).toBeInTheDocument();
  });

  it("renders with accessible section label", () => {
    render(<VendorDetail vendor={mockVendor} />);
    expect(screen.getByRole("region", { name: /vendor details/i })).toBeInTheDocument();
  });
});
