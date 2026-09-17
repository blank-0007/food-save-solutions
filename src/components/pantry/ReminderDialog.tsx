import { useEffect, useState } from "react";
import { BellRing, BellOff, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  dueItems,
  expiryPhrase,
  notificationPermission,
  requestNotificationPermission,
  type ReminderSettings,
} from "@/lib/reminders";
import type { FoodItem } from "@/lib/pantry";

const LEAD_OPTIONS = [1, 2, 3, 5, 7];

export function ReminderDialog({
  open,
  onOpenChange,
  settings,
  onChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReminderSettings;
  onChange: (settings: ReminderSettings) => void;
  items: FoodItem[];
}) {
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    if (open) setPermission(notificationPermission());
  }, [open]);

  async function toggle(enabled: boolean) {
    if (enabled) {
      const p = await requestNotificationPermission();
      setPermission(p);
      if (p === "denied") {
        toast.info("Pop-up alerts are blocked, so reminders will show inside the app instead.");
      }
    }
    onChange({ ...settings, enabled });
  }

  const upcoming = dueItems(items, settings.leadDays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-md overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Expiry reminders</DialogTitle>
          <DialogDescription>
            Get alerted before food in your pantry goes past its date.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                {settings.enabled ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              </div>
              <div>
                <Label htmlFor="reminders-toggle" className="text-sm font-semibold">
                  Reminders on
                </Label>
                <p className="text-xs text-muted-foreground">
                  {permission === "granted"
                    ? "Alerts appear on this device."
                    : permission === "unsupported"
                      ? "This browser shows reminders inside the app."
                      : "We'll ask for permission to show alerts."}
                </p>
              </div>
            </div>
            <Switch id="reminders-toggle" checked={settings.enabled} onCheckedChange={toggle} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-days">Remind me when food expires within</Label>
            <Select
              value={String(settings.leadDays)}
              onValueChange={(v) => onChange({ ...settings, leadDays: Number(v) })}
            >
              <SelectTrigger id="lead-days" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d === 1 ? "1 day" : `${d} days`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Needs attention ({upcoming.length})
            </p>
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.slice(0, 6).map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-sm"
                  >
                    <span className="truncate font-medium">{i.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{expiryPhrase(i)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                Nothing is close to its date right now. Nice work.
              </p>
            )}
          </div>

          <Button className="h-11 w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
