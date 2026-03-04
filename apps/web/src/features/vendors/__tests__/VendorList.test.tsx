import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VendorList } from "../components/VendorList";
import { Vendor } from "@pagio/shared";

const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Acme Corp",
    email: "billing@acme.com",
    taxId: "US123",
    organizationId: "org1",
  },
  {
    id: "2",
    name: "Beta LLC",
    email: "pay@beta.com",
    taxId: "US456",
    organizationId: "org1",
  },
];

describe("VendorList", () => {
  it("shows loading state", () => {
    render(<VendorList vendors={[]} loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows empty state when no vendors", () => {
    render(<VendorList vendors={[]} loading={false} />);
    expect(screen.getByText(/no vendors/i)).toBeInTheDocument();
  });

  it("renders vendor names and emails", () => {
    render(<VendorList vendors={mockVendors} loading={false} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("billing@acme.com")).toBeInTheDocument();
    expect(screen.getByText("Beta LLC")).toBeInTheDocument();
  });

  it("calls onSelect when a vendor is clicked", () => {
    const onSelect = jest.fn();
    render(<VendorList vendors={mockVendors} loading={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Acme Corp"));
    expect(onSelect).toHaveBeenCalledWith(mockVendors[0]);
  });

  it("marks the selected vendor with aria-current", () => {
    render(<VendorList vendors={mockVendors} loading={false} selectedId="1" />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-current", "true");
    expect(buttons[1]).not.toHaveAttribute("aria-current");
  });
});
