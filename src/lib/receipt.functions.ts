import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  imageBase64: z.string().min(100).max(12_000_000),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp|heic|heif)$/),
});

export type ParsedReceiptItem = {
  name: string;
  category: string;
  price: number | null;
  purchaseDate: string | null;
  expiryDate: string | null;
};

export type ParseReceiptResult = {
  items: ParsedReceiptItem[];
  purchaseDate: string | null;
  store: string | null;
  total: number | null;
  error?: string;
};

const SYSTEM_PROMPT = `You read photos of grocery receipts and extract the food items.
Return ONLY the items a household would store as food or drink. Ignore bags, discounts,
loyalty lines, subtotals, taxes and non-food goods.
For each item return:
- name: a clean, human-readable product name (expand obvious abbreviations, Title Case)
- category: exactly one of Produce, Dairy, Pantry, Meat, Beverages
- price: the line price as a number, or null if unreadable
- expiryDate: a use-by date printed on the receipt in YYYY-MM-DD, or null if none is printed
Also return the purchase date printed on the receipt (YYYY-MM-DD or null), the store name, and the receipt total.
If the image is not a receipt, return an empty items array.`;

export const parseReceipt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ParseReceiptResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { items: [], purchaseDate: null, store: null, total: null, error: "AI is not configured." };
    }

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.8-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Extract every food and drink line item from this receipt." },
                {
                  type: "image_url",
                  image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_receipt",
                description: "Return the structured receipt contents.",
                parameters: {
                  type: "object",
                  properties: {
                    store: { type: ["string", "null"] },
                    purchaseDate: { type: ["string", "null"] },
                    total: { type: ["number", "null"] },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          category: {
                            type: "string",
                            enum: ["Produce", "Dairy", "Pantry", "Meat", "Beverages"],
                          },
                          price: { type: ["number", "null"] },
                          expiryDate: { type: ["string", "null"] },
                        },
                        required: ["name", "category", "price", "expiryDate"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["store", "purchaseDate", "total", "items"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_receipt" } },
        }),
      });
    } catch (e) {
      console.error("receipt scan network error", e);
      return {
        items: [],
        purchaseDate: null,
        store: null,
        total: null,
        error: "Couldn't reach the scanner. Please try again.",
      };
    }

    if (response.status === 429) {
      return {
        items: [],
        purchaseDate: null,
        store: null,
        total: null,
        error: "Too many scans right now — please wait a moment and try again.",
      };
    }
    if (response.status === 402) {
      return {
        items: [],
        purchaseDate: null,
        store: null,
        total: null,
        error: "The AI credits for this app have run out.",
      };
    }
    if (!response.ok) {
      console.error("receipt scan failed", response.status, await response.text());
      return {
        items: [],
        purchaseDate: null,
        store: null,
        total: null,
        error: "The scanner couldn't read that image. Try a clearer photo.",
      };
    }

    const payload = (await response.json()) as {
      choices?: {
        message?: {
          content?: string | null;
          tool_calls?: { function?: { arguments?: string } }[];
        };
      }[];
    };

    const raw =
      payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ??
      payload.choices?.[0]?.message?.content ??
      "";

    let parsed: {
      store?: string | null;
      purchaseDate?: string | null;
      total?: number | null;
      items?: ParsedReceiptItem[];
    };
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "")) as typeof parsed;
    } catch {
      return {
        items: [],
        purchaseDate: null,
        store: null,
        total: null,
        error: "The scanner couldn't read that receipt. Try a clearer photo.",
      };
    }

    const isoDate = (v: unknown) =>
      typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;

    return {
      store: typeof parsed.store === "string" ? parsed.store : null,
      purchaseDate: isoDate(parsed.purchaseDate),
      total: typeof parsed.total === "number" ? parsed.total : null,
      items: (parsed.items ?? [])
        .filter((i) => i && typeof i.name === "string" && i.name.trim().length > 0)
        .slice(0, 40)
        .map((i) => ({
          name: i.name.trim().slice(0, 80),
          category: typeof i.category === "string" ? i.category : "Pantry",
          price: typeof i.price === "number" && Number.isFinite(i.price) ? i.price : null,
          purchaseDate: null,
          expiryDate: isoDate(i.expiryDate),
        })),
    };
  });
