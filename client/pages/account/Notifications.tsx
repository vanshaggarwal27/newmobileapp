import MobileShell from "@/components/layout/MobileShell";
import { settingsStore, userStore } from "@/data/user";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";

export default function Notifications() {
  const s = settingsStore.get();

  const set = (key: keyof typeof s.notifications, val: boolean) => {
    const next = { ...s, notifications: { ...s.notifications, [key]: val } };
    settingsStore.save(next);
  };

  const [items, setItems] = useState<
    { id: string; message: string; sent_at?: any; status?: string }[]
  >([]);
  useEffect(() => {
    (async () => {
      try {
        const u = userStore.get();
        if (!u?.id) return;
        const q = query(
          collection(db, "notifications"),
          where("user_id", "==", u.id),
          orderBy("sent_at", "desc"),
          limit(20),
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setItems(rows);
      } catch {}
    })();
  }, []);

  return (
    <MobileShell>
      <h1 className="mb-4 text-2xl font-bold">Notifications</h1>
      <div className="divide-y rounded-xl border bg-card">
        <Row
          label="Push notifications"
          checked={s.notifications.push}
          onChange={(v) => set("push", v)}
        />
        <Row
          label="Email updates"
          checked={s.notifications.email}
          onChange={(v) => set("email", v)}
        />
        <Row
          label="SMS alerts"
          checked={s.notifications.sms}
          onChange={(v) => set("sms", v)}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Changes are saved automatically.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold">Recent</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="rounded-xl border bg-card p-3">
              <div className="text-sm">{n.message}</div>
              {n.sent_at?.toDate ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {n.sent_at.toDate().toLocaleString()}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </MobileShell>
  );
}

function Row({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <span className="font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
