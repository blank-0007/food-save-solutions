import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category, type FoodItem } from "@/lib/pantry";

export function EditItemDialog({
  item,
  onOpenChange,
  onSave,
}: {
  item: FoodItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (item: FoodItem) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Produce");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setCategory(item.category);
    setPurchaseDate(item.purchaseDate);
    setExpiryDate(item.expiryDate);
  }, [item]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    if (!name.trim()) {
      toast.error("Please give the item a name.");
      return;
    }
    if (expiryDate < purchaseDate) {
      toast.error("The expiry date can't be before the purchase date.");
      return;
    }
    onSave({ ...item, name: name.trim(), category, purchaseDate, expiryDate });
    toast.success(`${name.trim()} updated.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit item</DialogTitle>
          <DialogDescription>Update the details of this pantry item.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Item name</Label>
            <Input
              id="edit-name"
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger id="edit-category" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-purchase">Purchase date</Label>
              <Input
                id="edit-purchase"
                type="date"
                className="h-11"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiry">Expiry date</Label>
              <Input
                id="edit-expiry"
                type="date"
                className="h-11"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button type="submit" className="h-11 flex-1">
              <Save className="h-4 w-4" /> Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
