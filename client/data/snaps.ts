export type SnapStatus = "submitted" | "in_progress" | "resolved";

export interface SnapItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  createdAt: number;
  status: SnapStatus;
  location?: string;
  image?: string; // data URL or path
  repostOf?: { title: string; blurb?: string };
}

const KEY = "app:snaps";

export const snapsStore = {
  all(): SnapItem[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as SnapItem[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  },
  save(list: SnapItem[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
  },
  add(item: SnapItem) {
    const list = snapsStore.all();
    list.unshift(item);
    snapsStore.save(list);
  },
  seedIfEmpty() {
    const list = snapsStore.all();
    if (list.length === 0) {
      snapsStore.save([
        {
          id: crypto.randomUUID(),
          title: "Graffiti - General",
          category: "Graffiti",
          description: "Tagging on lane wall near cafe entrance.",
          createdAt: Date.now() - 1000 * 60 * 60 * 5,
          status: "submitted",
          location: "Near you",
          image:
            "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1200&auto=format&fit=crop",
        },
        {
          id: crypto.randomUUID(),
          title: "Dumped Rubbish",
          category: "Rubbish",
          description: "Couch dumped on nature strip.",
          createdAt: Date.now() - 1000 * 60 * 60 * 26,
          status: "in_progress",
          location: "CBD",
          image:
            "https://images.unsplash.com/photo-1513116476489-7635e79feb27?q=80&w=1200&auto=format&fit=crop",
        },
      ]);
    }
  },
};
