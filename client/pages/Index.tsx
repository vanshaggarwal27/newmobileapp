import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MobileShell from "@/components/layout/MobileShell";
import {
  BadgeCheck,
  Bookmark,
  Share2,
  ShieldCheck,
  MapPin,
  Filter,
  ChevronRight,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocationState } from "@/context/location";
import { Link } from "react-router-dom";
import T from "@/components/T";
import { useEffect, useState } from "react";

interface FeedItem {
  id: string;
  title: string;
  solver: string;
  time: string;
  blurb: string;
  image: string;
}

export default function Index() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  useEffect(() => {
    (async () => {
      const { collection, onSnapshot, orderBy, limit, query } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const q = query(collection(db, "complaints"), orderBy("created_at", "desc"), limit(10));
      onSnapshot(q, (snap) => {
        const items: FeedItem[] = [];
        snap.forEach((d) => {
          const v: any = d.data();
          const firstImg = Array.isArray(v.media_files)
            ? (v.media_files.find((m: any) => m?.type === "image" && m?.url)?.url || "")
            : "";
          items.push({
            id: v.complaint_id || d.id,
            title: v.title || "Complaint",
            solver: v.solver || "Local Authority",
            time: v.created_at || "",
            blurb: v.description || "",
            image: firstImg || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
          });
        });
        setFeed(items);
      });
    })();
  }, []);

  const loc = useLocationState();
  return (
    <MobileShell>
      {/* Location banner */}
      {!loc.cityLine && (
        <div className="mb-3 rounded-xl bg-foreground/5 px-4 py-3 text-sm flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 text-primary" />
          <div className="flex-1">
            <p className="font-medium">
              <T>See what's happening around you.</T>
            </p>
            <p className="text-muted-foreground">
              <T>Provide your location to personalise the feed.</T>
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-full px-3"
            onClick={loc.startLive}
            disabled={loc.loading}
          >
            {loc.loading ? <T>Locating...</T> : <T>Provide</T>}
          </Button>
        </div>
      )}

      {/* Hero */}
      <Link
        to="/account"
        className="group relative block overflow-hidden rounded-2xl"
        aria-label="Go to account"
      >
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
          alt="Hero"
          className="h-40 w-full object-cover transition-transform group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="pointer-events-none absolute bottom-3 left-4 text-white text-lg font-semibold drop-shadow">
          <T>Spring into action</T>
        </div>
      </Link>

      {/* Quick links */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-3">
          <span className="inline-grid size-8 place-items-center rounded-full bg-white ring-2 ring-white shadow">
            <BadgeCheck className="size-4 text-primary" />
          </span>
          <span className="inline-grid size-8 place-items-center rounded-full bg-white ring-2 ring-white shadow">
            <BadgeCheck className="size-4 text-primary" />
          </span>
          <span className="inline-grid size-8 place-items-center rounded-full bg-white ring-2 ring-white shadow">
            <BadgeCheck className="size-4 text-primary" />
          </span>
        </div>
        <div className="text-sm font-medium">
          <T>Solvers Near Me</T>
        </div>
        <ChevronRight className="ml-auto size-4 opacity-60" />
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        <FilterChip active>Nearby</FilterChip>
        <FilterChip>Solved</FilterChip>
        <FilterChip>Dumped Rubbish</FilterChip>
        <FilterChip>Graffiti - General</FilterChip>
        <Button variant="ghost" className="h-8 px-3 text-xs">
          <Filter className="mr-1 size-4" />
          Filter
        </Button>
      </div>

      {/* Feed */}
      <section className="mt-4 space-y-6">
        {feed.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border bg-card shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>{item.time}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <BadgeCheck className="size-4" />
                  Snapped
                </span>
              </div>
              <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.blurb}</p>
            </div>
            <Link
              to="/account"
              className="mx-4 block overflow-hidden rounded-xl"
              aria-label="Go to account"
            >
              <img
                src={item.image}
                alt=""
                className="aspect-[16/9] w-full object-cover cursor-pointer transition-transform hover:scale-[1.01]"
              />
            </Link>
            <div className="p-4 pt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Solver</span>
              <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                {item.solver}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-accent"
                  onClick={() =>
                    navigate(
                      `/repost?title=${encodeURIComponent(item.title)}&blurb=${encodeURIComponent(item.blurb)}&category=${encodeURIComponent("Community")}`,
                    )
                  }
                >
                  <Camera className="size-4" /> Repost
                </button>
                <IconButton aria-label="Bookmark">
                  <Bookmark className="size-5" />
                </IconButton>
                <IconButton aria-label="Share">
                  <Share2 className="size-5" />
                </IconButton>
              </div>
            </div>
          </article>
        ))}
      </section>
    </MobileShell>
  );
}

function IconButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("rounded-full p-2 hover:bg-accent", className)}
      {...props}
    >
      {children}
    </button>
  );
}

function FilterChip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "h-8 whitespace-nowrap rounded-full border px-3 text-xs font-medium",
        active
          ? "bg-primary text-primary-foreground border-transparent"
          : "bg-white",
      )}
    >
      {children}
    </button>
  );
}
