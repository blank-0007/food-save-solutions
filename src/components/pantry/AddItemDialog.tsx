import { useRef, useState } from "react";
import { Plus, Upload, Sparkles, Loader2, ScanLine } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  addDays,
  formatDate,
  mockScanReceipt,
  todayISO,
  uid,
  type Category,
  type FoodItem,
} from "@/lib/pantry";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (items: FoodItem[]) => void;
};

export function AddItemDialog({ open, onOpenChange, onAdd }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Produce");
  const [purchaseDate, setPurchaseDate] = useState(todayISO());
  const [expiryDate, setExpiryDate] = useState(addDays(todayISO(), 7));

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState<FoodItem[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function resetAll() {
    setName("");
    setCategory("Produce");
    setPurchaseDate(todayISO());
    setExpiryDate(addDays(todayISO(), 7));
    setScanning(false);
    setProgress(0);
    setScanned(null);
    setFileName(null);
    setDragging(false);
  }

  function close() {
    onOpenChange(false);
    setTimeout(resetAll, 200);
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please give the item a name.");
      return;
    }
    if (expiryDate < purchaseDate) {
      toast.error("The expiry date can't be before the purchase date.");
      return;
    }
    onAdd([{ id: uid(), name: name.trim(), category, purchaseDate, expiryDate }]);
    toast.success(`${name.trim()} added to your pantry.`);
    close();
  }

  function startScan(file: File) {
    setFileName(file.name);
    setScanned(null);
    setScanning(true);
    setProgress(0);
    const started = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - started) / 2600) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setScanning(false);
        setScanned(mockScanReceipt());
      }
    }, 90);
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a photo of your receipt.");
      return;
    }
    startScan(file);
  }

  function importScanned() {
    if (!scanned?.length) return;
    onAdd(scanned);
    toast.success(`${scanned.length} items imported to your pantry.`);
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add to pantry</DialogTitle>
          <DialogDescription>
            Enter an item by hand, or let the AI scanner read your receipt.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual entry</TabsTrigger>
            <TabsTrigger value="scan">Scan Receipt (AI)</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={submitManual} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item name</Label>
                <Input
                  id="item-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baby spinach"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger id="item-category" className="h-11 w-full">
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
                  <Label htmlFor="purchase-date">Purchase date</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    className="h-11"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry-date">Expiry date</Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    className="h-11"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="h-11 w-full">
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="scan" className="mt-4 space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                onFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragging ? "border-primary bg-accent/60" : "border-border bg-muted/40",
              )}
            >
              <Upload className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">
                {fileName ?? "Tap to upload or drop a receipt photo"}
              </p>
              <p className="text-xs text-muted-foreground">JPG or PNG · camera and gallery supported</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>

            {scanning && (
              <div className="space-y-2 rounded-xl bg-secondary p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Scanning receipt… reading line items
                </p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            )}

            {scanned && !scanning && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" /> {scanned.length} items detected
                  </p>
                  <Badge variant="secondary" className="rounded-full">
                    Review before importing
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Check each line — expiry dates are estimated, so adjust anything that looks off.
                </p>
                <ul className="space-y-3">
                  {scanned.map((s) => (
                    <li key={s.id} className="space-y-3 rounded-xl border border-border bg-card p-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1.5">
                          <Label htmlFor={`scan-name-${s.id}`} className="text-xs text-muted-foreground">
                            Item name
                          </Label>
                          <Input
                            id={`scan-name-${s.id}`}
                            className="h-10"
                            value={s.name}
                            onChange={(e) => updateScanned(s.id, { name: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="mt-6 h-10 w-10 shrink-0 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => removeScanned(s.id)}
                          aria-label={`Remove ${s.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`scan-cat-${s.id}`} className="text-xs text-muted-foreground">
                          Category
                        </Label>
                        <Select
                          value={s.category}
                          onValueChange={(v) => updateScanned(s.id, { category: v as Category })}
                        >
                          <SelectTrigger id={`scan-cat-${s.id}`} className="h-10 w-full">
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
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`scan-bought-${s.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Purchase date
                          </Label>
                          <Input
                            id={`scan-bought-${s.id}`}
                            type="date"
                            className="h-10"
                            value={s.purchaseDate}
                            onChange={(e) => updateScanned(s.id, { purchaseDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`scan-expiry-${s.id}`}
                            className="text-xs text-muted-foreground"
                          >
                            Expiry date
                          </Label>
                          <Input
                            id={`scan-expiry-${s.id}`}
                            type="date"
                            className="h-10"
                            value={s.expiryDate}
                            onChange={(e) => updateScanned(s.id, { expiryDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires {formatDate(s.expiryDate)}
                      </p>
                    </li>
                  ))}
                </ul>
                <Button
                  className="h-11 w-full"
                  onClick={importScanned}
                  disabled={scanned.length === 0}
                >
                  <ScanLine className="h-4 w-4" />{" "}
                  {scanned.length ? `Import ${scanned.length} items to pantry` : "Nothing to import"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
