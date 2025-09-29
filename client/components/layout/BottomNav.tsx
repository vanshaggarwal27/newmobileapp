import { NavLink } from "react-router-dom";
import { Home, ClipboardList, Camera, User, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-md">
        <div className="relative border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <ul className="grid grid-cols-5 items-center h-16 text-xs">
            <li className="text-center">
              <Tab to="/" icon={<Home className="size-5" />} label="Home" />
            </li>
            <li className="text-center">
              <Tab to="/snaps" icon={<ClipboardList className="size-5" />} label="My Snaps" />
            </li>
            <li className="relative text-center">
              <NavLink to="/snap" className="inline-flex -translate-y-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg size-14">
                <Camera className="size-6" />
              </NavLink>
            </li>
            <li className="text-center">
              <Tab to="/account" icon={<User className="size-5" />} label="Account" />
            </li>
            <li className="text-center">
              <Tab to="/more" icon={<MoreHorizontal className="size-5" />} label="More" />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Tab({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1 px-2 py-2 text-foreground/70",
          isActive && "text-primary"
        )
      }
    >
      {icon}
      <span className="leading-none">{label}</span>
    </NavLink>
  );
}
