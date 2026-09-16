import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntil, type Status } from "@/lib/pantry";

export function StatusPill({ status, expiryDate }: { status: Status; expiryDate: string }) {
  const d = daysUntil(expiryDate);
  const map = {
    fresh: {
      Icon: CheckCircle2,
      label: `Fresh · ${d}d left`,
      cls: "bg-fresh text-fresh-foreground",
    },
    soon: {
      Icon: Clock,
      label: d === 0 ? "Expires today" : `Expiring soon · ${d}d`,
      cls: "bg-warn text-warn-foreground",
    },
    expired: {
      Icon: AlertTriangle,
      label: `Expired ${Math.abs(d)}d ago`,
      cls: "bg-danger text-danger-foreground",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        map.cls,
      )}
    >
      <map.Icon className="h-3.5 w-3.5" />
      {map.label}
    </span>
  );
}
