import type { AIExtractor, ExtractedInvoice } from "../ports/ai.extractor";
import type { Invoice } from "../domain/invoice";

// Implementation added in S-05
export class ClaudeExtractor implements AIExtractor {
  async extract(_fileUrl: string, _invoice: Invoice): Promise<ExtractedInvoice> {
    throw new Error("ClaudeExtractor not yet implemented — S-05");
  }
}
