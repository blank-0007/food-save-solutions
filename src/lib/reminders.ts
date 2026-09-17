import { daysUntil, statusOf, todayISO, type FoodItem } from "./pantry";

export type ReminderSettings = {
  enabled: boolean;
  leadDays: number; // notify when an item expires within this many days
};

export const DEFAULT_REMINDERS: ReminderSettings = { enabled: false, leadDays: 3 };

const settingsKey = (email: string) => `ecopantry.reminders.${email.toLowerCase()}`;
const sentKey = (email: string) => `ecopantry.reminders.sent.${email.toLowerCase()}`;

export function loadReminders(email: string): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_REMINDERS;
  try {
    const raw = localStorage.getItem(settingsKey(email));
    if (raw) return { ...DEFAULT_REMINDERS, ...(JSON.parse(raw) as Partial<ReminderSettings>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_REMINDERS;
}

export function saveReminders(email: string, settings: ReminderSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(settingsKey(email), JSON.stringify(settings));
}

function loadSent(email: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(sentKey(email));
    if (raw) return JSON.parse(raw) as Record<string, string>;
  } catch {
    /* ignore */
  }
  return {};
}

function saveSent(email: string, sent: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(sentKey(email), JSON.stringify(sent));
}

/** Items that should trigger a reminder: expiring within leadDays (or already expired). */
export function dueItems(items: FoodItem[], leadDays: number): FoodItem[] {
  return items
    .filter((i) => daysUntil(i.expiryDate) <= leadDays)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export function expiryPhrase(item: FoodItem): string {
  const d = daysUntil(item.expiryDate);
  if (d < 0) return `already expired ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago`;
  if (d === 0) return "expires today";
  if (d === 1) return "expires tomorrow";
  return `expires in ${d} days`;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Sends reminders for items due soon, at most once per item per day.
 * Falls back to the in-app toast callback when system notifications aren't allowed.
 */
export function runReminderCheck(
  email: string,
  items: FoodItem[],
  settings: ReminderSettings,
  fallback: (message: string) => void,
) {
  if (!settings.enabled) return;
  const today = todayISO();
  const sent = loadSent(email);
  const due = dueItems(items, settings.leadDays).filter((i) => sent[i.id] !== today);
  if (!due.length) return;

  for (const item of due) sent[item.id] = today;
  saveSent(email, sent);

  const first = due[0]!;
  const soonCount = due.filter((i) => statusOf(i) !== "expired").length;
  const title = due.length === 1 ? `${first.name} ${expiryPhrase(first)}` : `${due.length} items need using up`;
  const body =
    due.length === 1
      ? "Open EcoPantry for a recipe idea before it goes to waste."
      : `${due.map((i) => i.name).slice(0, 4).join(", ")}${due.length > 4 ? "…" : ""}${
          soonCount ? "" : " — all past their date"
        }`;

  if (notificationPermission() === "granted") {
    try {
      new Notification(title, { body, tag: "ecopantry-expiry" });
      return;
    } catch {
      /* fall through to toast */
    }
  }
  fallback(`${title} — ${body}`);
}
