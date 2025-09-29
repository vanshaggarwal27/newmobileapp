import MobileShell from "@/components/layout/MobileShell";
import { ChevronRight, Bell, Globe, LogOut, User, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, userStore } from "@/data/user";

export default function Account() {
  const navigate = useNavigate();
  const user = userStore.get();
  const display = user?.first ? `${user.first}` + (user?.last ? ` ${user.last}` : "") : "Guest";

  return (
    <MobileShell>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-full bg-secondary text-lg font-semibold">
          {(user?.first?.[0] || "G").toUpperCase()}{(user?.last?.[0] || "").toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Welcome,</p>
          <h1 className="text-xl font-bold">{display}</h1>
        </div>
      </div>

      <div className="divide-y rounded-xl border bg-card">
        <Row icon={<User className="size-5 text-primary"/>} title="Profile" onClick={() => navigate("/account/profile")} />
        <Row icon={<Bell className="size-5 text-primary"/>} title="Notifications" onClick={() => navigate("/account/notifications")} />
        <Row icon={<Globe className="size-5 text-primary"/>} title="Language" onClick={() => navigate("/account/language")} />
        <Row icon={<LogOut className="size-5 text-primary"/>} title="Sign out" onClick={() => { auth.signOut(); navigate("/auth/intro2"); }} />
      </div>

      <button
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm text-destructive"
        onClick={() => { auth.deleteAccount(); navigate("/auth/start"); }}
      >
        <Trash2 className="size-4"/> Delete account
      </button>
    </MobileShell>
  );
}

function Row({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-accent">
      <div className="flex items-center gap-3">
        <span className="inline-grid size-8 place-items-center rounded-full bg-secondary">{icon}</span>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}
