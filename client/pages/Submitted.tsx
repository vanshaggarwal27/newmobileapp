import MobileShell from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function Submitted() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <MobileShell>
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="size-16 text-green-600" aria-hidden />
        <h1 className="text-2xl font-bold">Issue submitted</h1>
        <p className="text-sm text-muted-foreground">
          Your complaint was sent successfully.
        </p>
        {id ? (
          <p className="text-xs text-muted-foreground">
            Reference: <span className="font-mono">{id}</span>
          </p>
        ) : null}
        <div className="mt-4 flex w-full max-w-xs gap-3">
          <Button className="w-full" onClick={() => navigate("/snaps")}>
            View My Snaps
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
