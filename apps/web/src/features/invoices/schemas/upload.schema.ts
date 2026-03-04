import { z } from "zod";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((f) => ACCEPTED_TYPES.includes(f.type), "Only PDF, JPG, and PNG files are supported")
    .refine((f) => f.size <= MAX_SIZE, "File must be 10 MB or smaller"),
});

export type UploadInput = z.infer<typeof uploadSchema>;
