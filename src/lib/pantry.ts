export type Category = "Produce" | "Dairy" | "Pantry" | "Meat" | "Beverages";

export const CATEGORIES: Category[] = ["Produce", "Dairy", "Pantry", "Meat", "Beverages"];

export type FoodItem = {
  id: string;
  name: string;
  category: Category;
  purchaseDate: string; // yyyy-mm-dd
  expiryDate: string; // yyyy-mm-dd
};

export type Status = "fresh" | "soon" | "expired";

export type User = { name: string; email: string };

const USER_KEY = "ecopantry.user";
const itemsKey = (email: string) => `ecopantry.items.${email.toLowerCase()}`;

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso: string): number {
  const a = new Date(todayISO() + "T00:00:00").getTime();
  const b = new Date(iso + "T00:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export function statusOf(item: FoodItem): Status {
  const d = daysUntil(item.expiryDate);
  if (d < 0) return "expired";
  if (d <= 3) return "soon";
  return "fresh";
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function loadItems(email: string): FoodItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(itemsKey(email));
    if (raw) return JSON.parse(raw) as FoodItem[];
  } catch {
    /* ignore */
  }
  const seed = seedItems();
  saveItems(email, seed);
  return seed;
}

export function saveItems(email: string, items: FoodItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(itemsKey(email), JSON.stringify(items));
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seedItems(): FoodItem[] {
  const t = todayISO();
  const mk = (
    name: string,
    category: Category,
    bought: number,
    expires: number,
  ): FoodItem => ({
    id: uid(),
    name,
    category,
    purchaseDate: addDays(t, bought),
    expiryDate: addDays(t, expires),
  });
  return [
    mk("Baby Spinach", "Produce", -4, 1),
    mk("Whole Milk", "Dairy", -6, -1),
    mk("Greek Yogurt", "Dairy", -2, 9),
    mk("Chicken Thighs", "Meat", -1, 2),
    mk("Brown Rice", "Pantry", -20, 240),
    mk("Orange Juice", "Beverages", -3, 5),
    mk("Roma Tomatoes", "Produce", -2, 3),
  ];
}

/* ---------- Receipt scan simulation ---------- */

type ScanTemplate = { name: string; category: Category; shelfLife: number };

const RECEIPT_POOL: ScanTemplate[] = [
  { name: "Bananas", category: "Produce", shelfLife: 5 },
  { name: "Avocados", category: "Produce", shelfLife: 4 },
  { name: "Cheddar Cheese", category: "Dairy", shelfLife: 21 },
  { name: "Free-Range Eggs", category: "Dairy", shelfLife: 18 },
  { name: "Sourdough Loaf", category: "Pantry", shelfLife: 4 },
  { name: "Ground Beef", category: "Meat", shelfLife: 2 },
  { name: "Salmon Fillet", category: "Meat", shelfLife: 2 },
  { name: "Sparkling Water", category: "Beverages", shelfLife: 180 },
  { name: "Cold Brew Coffee", category: "Beverages", shelfLife: 12 },
  { name: "Olive Oil", category: "Pantry", shelfLife: 365 },
  { name: "Red Bell Peppers", category: "Produce", shelfLife: 7 },
  { name: "Butter", category: "Dairy", shelfLife: 30 },
];

export function mockScanReceipt(): FoodItem[] {
  const t = todayISO();
  const pool = [...RECEIPT_POOL].sort(() => Math.random() - 0.5);
  const count = 4 + Math.floor(Math.random() * 3);
  return pool.slice(0, count).map((p) => ({
    id: uid(),
    name: p.name,
    category: p.category,
    purchaseDate: t,
    expiryDate: addDays(t, p.shelfLife),
  }));
}

/* ---------- Recipe generation simulation ---------- */

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
