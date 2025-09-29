import { ReactNode, useEffect } from "react";
import { MapPin, Bell, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNav from "./BottomNav";
import { useLocationState } from "@/context/location";

interface MobileShellProps {
  children: ReactNode;
  className?: string;
}

export default function MobileShell({ children, className }: MobileShellProps) {
  const loc = useLocationState();
  useEffect(() => {
    if (!loc.live && !loc.cityLine) loc.startLive();
  }, [loc.live, loc.cityLine, loc.startLive]);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => loc.startLive()}
            className="flex items-center gap-2 text-sm hover:opacity-90"
            aria-label="Set location"
          >
            <MapPin className="size-4 text-primary" />
            <span className="font-semibold">
              {loc.cityLine || (loc.coords ? `${loc.coords.lat.toFixed(3)}, ${loc.coords.lon.toFixed(3)}` : loc.loading ? "Locating..." : "")}
            </span>
            {loc.live && <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-green-500" />}
          </button>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="rounded-full p-2 hover:bg-accent">
              <Bell className="size-5" />
            </button>
            <button aria-label="Account" className="rounded-full bg-secondary size-8 grid place-items-center font-semibold">
              <User2 className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className={cn("mx-auto max-w-md px-4 pb-28 pt-4", className)}>{children}</main>

      <BottomNav />
    </div>
  );
}
