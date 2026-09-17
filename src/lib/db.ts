import { supabase } from "@/integrations/supabase/client";
import { toCategory, todayISO, type Category, type FoodItem } from "./pantry";

/* ---------- Pantry items ---------- */

type ItemRow = {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  expiry_date: string;
  price: number | string | null;
};

function toItem(row: ItemRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    category: toCategory(row.category),
    purchaseDate: row.purchase_date,
    expiryDate: row.expiry_date,
    price: row.price === null ? null : Number(row.price),
  };
}

export async function fetchItems(): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("id, name, category, purchase_date, expiry_date, price")
    .order("expiry_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => toItem(r as ItemRow));
}

export async function insertItems(userId: string, items: Omit<FoodItem, "id">[]) {
  const { error } = await supabase.from("pantry_items").insert(
    items.map((i) => ({
      user_id: userId,
      name: i.name,
      category: i.category,
      purchase_date: i.purchaseDate,
      expiry_date: i.expiryDate,
      price: i.price,
    })),
  );
  if (error) throw error;
}

export async function updateItem(item: FoodItem) {
  const { error } = await supabase
    .from("pantry_items")
    .update({
      name: item.name,
      category: item.category,
      purchase_date: item.purchaseDate,
      expiry_date: item.expiryDate,
      price: item.price,
    })
    .eq("id", item.id);
  if (error) throw error;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("pantry_items").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Shopping list ---------- */

export type ShoppingItem = {
  id: string;
  name: string;
  category: Category;
  note: string | null;
  source: string;
  checked: boolean;
};

export async function fetchShoppingList(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("id, name, category, note, source, checked")
    .order("checked", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    category: toCategory(r.category as string),
    note: (r.note as string | null) ?? null,
    source: (r.source as string) ?? "manual",
    checked: Boolean(r.checked),
  }));
}

export async function addShoppingItems(
  userId: string,
  items: { name: string; category?: Category; note?: string; source?: string }[],
) {
  if (!items.length) return;
  const { error } = await supabase.from("shopping_list_items").insert(
    items.map((i) => ({
      user_id: userId,
      name: i.name,
      category: i.category ?? "Pantry",
      note: i.note ?? null,
      source: i.source ?? "manual",
    })),
  );
  if (error) throw error;
}

export async function setShoppingChecked(id: string, checked: boolean) {
  const { error } = await supabase.from("shopping_list_items").update({ checked }).eq("id", id);
  if (error) throw error;
}

export async function deleteShoppingItem(id: string) {
  const { error } = await supabase.from("shopping_list_items").delete().eq("id", id);
  if (error) throw error;
}

export async function clearCheckedShopping(userId: string) {
  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("user_id", userId)
    .eq("checked", true);
  if (error) throw error;
}

/* ---------- Waste log ---------- */

export type WasteEntry = {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  estimatedValue: number;
  wastedOn: string;
  reason: string;
};

export async function fetchWaste(): Promise<WasteEntry[]> {
  const { data, error } = await supabase
    .from("waste_log")
    .select("id, name, category, quantity, estimated_value, wasted_on, reason")
    .order("wasted_on", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    category: toCategory(r.category as string),
    quantity: Number(r.quantity ?? 1),
    estimatedValue: Number(r.estimated_value ?? 0),
    wastedOn: r.wasted_on as string,
    reason: (r.reason as string) ?? "expired",
  }));
}

export async function logWaste(
  userId: string,
  entry: {
    name: string;
    category: Category;
    estimatedValue?: number;
    quantity?: number;
    reason?: string;
    wastedOn?: string;
  },
) {
  const { error } = await supabase.from("waste_log").insert({
    user_id: userId,
    name: entry.name,
    category: entry.category,
    quantity: entry.quantity ?? 1,
    estimated_value: entry.estimatedValue ?? 0,
    reason: entry.reason ?? "expired",
    wasted_on: entry.wastedOn ?? todayISO(),
  });
  if (error) throw error;
}

export async function deleteWaste(id: string) {
  const { error } = await supabase.from("waste_log").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Reminder settings ---------- */

export type Settings = {
  enabled: boolean;
  leadDays: number;
  expiryDayAlerts: boolean;
  emailAlerts: boolean;
  monthlyWasteGoal: number;
};

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  leadDays: 3,
  expiryDayAlerts: true,
  emailAlerts: false,
  monthlyWasteGoal: 10,
};

export async function fetchSettings(userId: string): Promise<Settings> {
  const { data, error } = await supabase
    .from("reminder_settings")
    .select("enabled, lead_days, expiry_day_alerts, email_alerts, monthly_waste_goal")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    await supabase.from("reminder_settings").insert({ user_id: userId });
    return DEFAULT_SETTINGS;
  }
  return {
    enabled: Boolean(data.enabled),
    leadDays: Number(data.lead_days ?? 3),
    expiryDayAlerts: Boolean(data.expiry_day_alerts),
    emailAlerts: Boolean(data.email_alerts),
    monthlyWasteGoal: Number(data.monthly_waste_goal ?? 10),
  };
}

export async function saveSettings(userId: string, settings: Settings) {
  const { error } = await supabase.from("reminder_settings").upsert({
    user_id: userId,
    enabled: settings.enabled,
    lead_days: settings.leadDays,
    expiry_day_alerts: settings.expiryDayAlerts,
    email_alerts: settings.emailAlerts,
    monthly_waste_goal: settings.monthlyWasteGoal,
  });
  if (error) throw error;
}

/* ---------- Alert history (so an alert fires once per item per day) ---------- */

export async function fetchTodaysAlerts(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("alert_log")
    .select("item_id")
    .eq("user_id", userId)
    .eq("sent_on", todayISO());
  if (error) throw error;
  return (data ?? []).map((r) => r.item_id as string).filter(Boolean);
}

export async function recordAlerts(userId: string, itemIds: string[], alertType: string) {
  if (!itemIds.length) return;
  const { error } = await supabase.from("alert_log").upsert(
    itemIds.map((id) => ({
      user_id: userId,
      item_id: id,
      alert_type: alertType,
      sent_on: todayISO(),
    })),
    { onConflict: "user_id,item_id,alert_type,sent_on" },
  );
  if (error) throw error;
}
