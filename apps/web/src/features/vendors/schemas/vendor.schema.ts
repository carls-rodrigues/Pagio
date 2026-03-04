import { z } from "zod";

export const createVendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  taxId: z.string().min(1, "Tax ID is required"),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
