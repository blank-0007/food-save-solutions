import { Trash2, ChefHat, CalendarDays, ShoppingBasket, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "./StatusPill";
import { formatDate, statusOf, type FoodItem } from "@/lib/pantry";

export function ItemCard({
  item,
  onDelete,
  onRecipe,
  onEdit,
}: {
  item: FoodItem;
  onDelete: (id: string) => void;
  onRecipe: (item: FoodItem) => void;
  onEdit: (item: FoodItem) => void;
}) {
  return (
    <article className="surface-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{item.name}</h3>
          <Badge variant="secondary" className="mt-1.5 rounded-full font-medium">
            {item.category}
          </Badge>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <ShoppingBasket className="h-5 w-5" />
        </div>
      </div>

      <StatusPill status={statusOf(item)} expiryDate={item.expiryDate} />

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Purchased
          </dt>
          <dd className="mt-0.5 font-medium">{formatDate(item.purchaseDate)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> Expires
          </dt>
          <dd className="mt-0.5 font-medium">{formatDate(item.expiryDate)}</dd>
        </div>
      </dl>

      <div className="mt-auto space-y-2">
        <Button className="h-11 w-full" onClick={() => onRecipe(item)}>
          <ChefHat className="h-4 w-4" /> Generate Recipe
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
