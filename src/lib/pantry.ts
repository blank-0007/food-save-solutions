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

/* ---------- Local (this-device) persistence & receipt demo ---------- */

export type User = { name: string; email: string };

const USER_KEY = "ecopantry.user";
const itemsKey = (email: string) => `ecopantry.items.${email}`;

export function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

const SEED: Omit<FoodItem, "id">[] = [
  { name: "Spinach", category: "Produce", purchaseDate: addDays(todayISO(), -4), expiryDate: addDays(todayISO(), 1), price: 2.4 },
  { name: "Greek Yogurt", category: "Dairy", purchaseDate: addDays(todayISO(), -6), expiryDate: addDays(todayISO(), 5), price: 3.9 },
  { name: "Chicken Thighs", category: "Meat", purchaseDate: addDays(todayISO(), -3), expiryDate: addDays(todayISO(), -1), price: 7.5 },
  { name: "Brown Rice", category: "Pantry", purchaseDate: addDays(todayISO(), -20), expiryDate: addDays(todayISO(), 150), price: 4.2 },
  { name: "Orange Juice", category: "Beverages", purchaseDate: addDays(todayISO(), -2), expiryDate: addDays(todayISO(), 9), price: 3.1 },
];

export function loadItems(email: string): FoodItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(itemsKey(email));
    if (raw) return JSON.parse(raw) as FoodItem[];
  } catch {
    /* fall through to seed */
  }
  const seeded = SEED.map((s) => ({ ...s, id: uid() }));
  saveItems(email, seeded);
  return seeded;
}

export function saveItems(email: string, items: FoodItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(itemsKey(email), JSON.stringify(items));
}

const RECEIPT_POOL: { name: string; category: Category; price: number }[] = [
  { name: "Bananas", category: "Produce", price: 1.8 },
  { name: "Whole Milk", category: "Dairy", price: 2.6 },
  { name: "Cheddar Cheese", category: "Dairy", price: 4.5 },
  { name: "Tomatoes", category: "Produce", price: 2.2 },
  { name: "Chicken Breast", category: "Meat", price: 8.1 },
  { name: "Pasta", category: "Pantry", price: 1.5 },
  { name: "Olive Oil", category: "Pantry", price: 6.9 },
  { name: "Sparkling Water", category: "Beverages", price: 2.0 },
  { name: "Carrots", category: "Produce", price: 1.4 },
  { name: "Minced Beef", category: "Meat", price: 7.3 },
  { name: "Butter", category: "Dairy", price: 3.3 },
  { name: "Orange Juice", category: "Beverages", price: 3.1 },
];

/** Demo receipt parsing used while the AI scanner is offline. */
export function mockScanReceipt(): DraftItem[] {
  const pool = [...RECEIPT_POOL].sort(() => Math.random() - 0.5);
  const count = 4 + Math.floor(Math.random() * 3);
  const purchaseDate = todayISO();
  return pool.slice(0, count).map((p) => ({
    id: uid(),
    name: p.name,
    category: p.category,
    price: p.price,
    purchaseDate,
    expiryDate: addDays(purchaseDate, SHELF_LIFE[p.category]),
  }));
}
