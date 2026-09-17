import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  Clock,
  Leaf,
  LogOut,
  Package,
  Plus,
  Search,
  SearchX,
  ShoppingBasket,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AddItemDialog } from "./AddItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { ItemCard } from "./ItemCard";
import { RecipeDialog } from "./RecipeDialog";
import { ReminderDialog } from "./ReminderDialog";
import {
  CATEGORIES,
  loadItems,
  saveItems,
  statusOf,
  type FoodItem,
  type User,
} from "@/lib/pantry";
import {
  DEFAULT_REMINDERS,
  dueItems,
  loadReminders,
  runReminderCheck,
  saveReminders,
  type ReminderSettings,
} from "@/lib/reminders";

const FILTERS = ["All", ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

export function Dashboard({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [addOpen, setAddOpen] = useState(false);
  const [recipeItem, setRecipeItem] = useState<FoodItem | null>(null);
  const [editItem, setEditItem] = useState<FoodItem | null>(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [reminders, setReminders] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const loaded = useRef(false);

  useEffect(() => {
    setItems(loadItems(user.email));
    setReminders(loadReminders(user.email));
    loaded.current = true;
  }, [user.email]);

  // Check for expiring food on load, then hourly while the app stays open.
  useEffect(() => {
    if (!loaded.current || !reminders.enabled) return;
    const check = () => runReminderCheck(user.email, items, reminders, (m) => toast.warning(m));
    const t = setTimeout(check, 800);
    const interval = setInterval(check, 60 * 60 * 1000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [user.email, items, reminders]);

  function update(next: FoodItem[]) {
    setItems(next);
    saveItems(user.email, next);
  }

  function updateReminders(next: ReminderSettings) {
    setReminders(next);
    saveReminders(user.email, next);
  }

  const stats = useMemo(() => {
    let soon = 0;
    let expired = 0;
    for (const i of items) {
      const s = statusOf(i);
      if (s === "soon") soon++;
      if (s === "expired") expired++;
    }
    return { total: items.length, soon, expired };
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (filter === "All" ? true : i.category === filter))
      .filter((i) => (q ? i.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  }, [items, query, filter]);

  const dueCount = useMemo(
    () => dueItems(items, reminders.leadDays).length,
    [items, reminders.leadDays],
  );

  const statCards = [
    { label: "Items in pantry", value: stats.total, Icon: Package, tone: "bg-secondary text-secondary-foreground" },
    { label: "Expiring in 3 days", value: stats.soon, Icon: Clock, tone: "bg-warn text-warn-foreground" },
    { label: "Expired items", value: stats.expired, Icon: AlertTriangle, tone: "bg-danger text-danger-foreground" },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="leaf-gradient grid h-9 w-9 place-items-center rounded-xl">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold">EcoPantry</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Hi {user.name}, let's waste nothing today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="relative h-10 w-10 p-0"
              onClick={() => setRemindersOpen(true)}
              aria-label="Expiry reminders"
            >
              {reminders.enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              {dueCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
                  {dueCount}
                </span>
              )}
            </Button>
            <Button className="hidden h-10 md:inline-flex" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
            <Button variant="ghost" className="h-10" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((s) => (
            <div key={s.label} className="surface-card flex items-center gap-4 p-5">
              <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", s.tone)}>
                <s.Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 pl-10"
              placeholder="Search your pantry…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search pantry items"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {visible.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={(id) => {
                  update(items.filter((i) => i.id !== id));
                  toast.success("Item removed from your pantry.");
                }}
                onRecipe={setRecipeItem}
                onEdit={setEditItem}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            isSearch={items.length > 0}
            onAdd={() => setAddOpen(true)}
            onClear={() => {
              setQuery("");
              setFilter("All");
            }}
          />
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <Button className="h-12 w-full text-base" onClick={() => setAddOpen(true)}>
          <Plus className="h-5 w-5" /> Add item
        </Button>
      </div>

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(newItems) => update([...newItems, ...items])}
      />
      <EditItemDialog
        item={editItem}
        onOpenChange={(o) => !o && setEditItem(null)}
        onSave={(updated) => update(items.map((i) => (i.id === updated.id ? updated : i)))}
      />
      <ReminderDialog
        open={remindersOpen}
        onOpenChange={setRemindersOpen}
        settings={reminders}
        onChange={updateReminders}
        items={items}
      />
      <RecipeDialog item={recipeItem} onOpenChange={(o) => !o && setRecipeItem(null)} />
    </div>
  );
}

function EmptyState({
  isSearch,
  onAdd,
  onClear,
}: {
  isSearch: boolean;
  onAdd: () => void;
  onClear: () => void;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        {isSearch ? <SearchX className="h-8 w-8" /> : <ShoppingBasket className="h-8 w-8" />}
      </div>
      <h2 className="text-xl font-semibold">
        {isSearch ? "No matching items" : "Your pantry is empty"}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isSearch
          ? "Try a different search term or pick another category to see what you have."
          : "Add your groceries by hand or scan a receipt, and we'll keep an eye on the expiry dates for you."}
      </p>
      {isSearch ? (
        <Button variant="outline" className="mt-2 h-11" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button className="mt-2 h-11" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add your first item
        </Button>
      )}
    </div>
  );
}
