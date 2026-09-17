export type Category = "Produce" | "Dairy" | "Pantry" | "Meat" | "Beverages";

export const CATEGORIES: Category[] = ["Produce", "Dairy", "Pantry", "Meat", "Beverages"];

export function toCategory(value: string | null | undefined): Category {
  const match = CATEGORIES.find((c) => c.toLowerCase() === (value ?? "").toLowerCase());
  return match ?? "Pantry";
}

export type FoodItem = {
  id: string;
  name: string;
  category: Category;
  purchaseDate: string; // yyyy-mm-dd
  expiryDate: string; // yyyy-mm-dd
  price: number | null;
};

/** A row parsed from a receipt, not yet saved. */
export type DraftItem = Omit<FoodItem, "id"> & { id: string };

export type Status = "fresh" | "soon" | "expired";

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysUntil(iso: string): number {
  const a = new Date(todayISO() + "T00:00:00").getTime();
  const b = new Date(iso + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export function statusOf(item: { expiryDate: string }): Status {
  const d = daysUntil(item.expiryDate);
  if (d < 0) return "expired";
  if (d <= 3) return "soon";
  return "fresh";
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Typical shelf life in days, used when a receipt has no expiry date on it. */
export const SHELF_LIFE: Record<Category, number> = {
  Produce: 6,
  Dairy: 14,
  Pantry: 180,
  Meat: 3,
  Beverages: 30,
};

/* ---------- Recipe generation ---------- */

export type Recipe = {
  title: string;
  prepTime: string;
  difficulty: string;
  servings: string;
  description: string;
  ingredients: { text: string; highlight: boolean }[];
  steps: string[];
};

const PAIRINGS: Record<Category, string[]> = {
  Produce: ["garlic", "olive oil", "lemon zest", "toasted pine nuts", "sea salt"],
  Dairy: ["cracked black pepper", "fresh herbs", "honey", "wholegrain toast", "nutmeg"],
  Pantry: ["onion", "vegetable stock", "smoked paprika", "bay leaf", "parsley"],
  Meat: ["rosemary", "garlic cloves", "new potatoes", "dijon mustard", "olive oil"],
  Beverages: ["fresh mint", "ice", "citrus wedges", "a drizzle of honey"],
};

const TITLES: Record<Category, string> = {
  Produce: "Zero-Waste {item} Skillet",
  Dairy: "Creamy {item} Rescue Bowl",
  Pantry: "One-Pot {item} Comfort Stew",
  Meat: "Herb-Roasted {item} Tray Bake",
  Beverages: "Chilled {item} Refresher",
};

export function generateRecipe(item: FoodItem): Recipe {
  const extras = PAIRINGS[item.category];
  const title = TITLES[item.category].replace("{item}", item.name);
  return {
    title,
    prepTime: `${15 + Math.floor(Math.random() * 20)} min`,
    difficulty: Math.random() < 0.66 ? "Easy" : "Medium",
    servings: `${2 + Math.floor(Math.random() * 3)} servings`,
    description: `A sustainable, waste-busting dish built around your ${item.name.toLowerCase()} before it goes off. Everything else is likely already in your kitchen.`,
    ingredients: [
      { text: `${item.name} (use it all — this is the star)`, highlight: true },
      ...extras.map((e) => ({ text: e, highlight: false })),
    ],
    steps: [
      `Prep the ${item.name.toLowerCase()}: rinse, trim and cut into even pieces so nothing usable is thrown away.`,
      `Warm a pan over medium heat with a little olive oil and soften the aromatics until fragrant, about 3 minutes.`,
      `Add the ${item.name.toLowerCase()} and cook, stirring occasionally, until just tender and lightly caramelised.`,
      `Season generously, add the remaining ingredients and let everything come together for 5–8 minutes.`,
      `Taste, adjust the seasoning, and serve warm. Any leftovers keep well for 2 days in a sealed container.`,
    ],
  };
}
