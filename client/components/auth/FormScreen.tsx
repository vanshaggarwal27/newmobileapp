import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FormScreen({
  title,
  children,
  progress = 0,
  className,
  bottom,
}: {
  title: string;
  children: ReactNode;
  progress?: number; // 0..100
  className?: string;
  bottom?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto max-w-md px-4 pb-8">
        <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <button aria-label="Back" onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-accent">
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="ml-2 text-xl font-semibold">{title}</h1>
        </div>
        <div className="-mx-4 mb-4 h-1 bg-muted">
          <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
        <div className="grid gap-4">{children}</div>
        {bottom ? <div className="mt-6">{bottom}</div> : null}
      </div>
    </div>
  );
}
