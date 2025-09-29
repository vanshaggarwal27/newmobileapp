import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormScreen from "@/components/auth/FormScreen";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { db, serverTimestamp } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { userStore } from "@/data/user";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const pendingRaw = localStorage.getItem("app:pendingUser");
      const pending = pendingRaw
        ? (JSON.parse(pendingRaw) as {
            first?: string;
            last?: string;
            phone?: string;
            email?: string;
          })
        : {};
      const uid = crypto.randomUUID();
      await setDoc(doc(db, "users", uid), {
        user_id: uid,
        name: `${pending.first || ""} ${pending.last || ""}`.trim(),
        phone: pending.phone || "",
        email: pending.email || email,
        role: "citizen",
        joined_at: serverTimestamp(),
      });
      userStore.save({
        id: uid,
        first: pending.first,
        last: pending.last,
        email: pending.email || email,
        phone: pending.phone,
        role: "citizen",
      });
      localStorage.setItem("app:promptLocation", "1");
      localStorage.removeItem("app:pendingUser");
      toast({
        title: "Verified",
        description: "Account created successfully.",
      });
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: String(err?.message ?? err),
      });
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      const pendingRaw = localStorage.getItem("app:pendingUser");
      const pending = pendingRaw
        ? (JSON.parse(pendingRaw) as { first?: string; last?: string })
        : {};
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: `${pending.first || ""} ${pending.last || ""}`.trim(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      toast({ title: "Code sent", description: `New code sent to ${email}` });
    } catch (err: any) {
      toast({
        title: "Failed to resend",
        description: String(err?.message ?? err),
      });
    }
  }

  return (
    <FormScreen
      title="Verify your email"
      progress={60}
      bottom={
        <p className="text-xs text-muted-foreground">
          Enter the 6‑digit code sent to your email.
        </p>
      }
    >
      <form onSubmit={onVerify} className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Enter the 6‑digit code</label>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          type="submit"
          className="h-12 rounded-full"
          disabled={otp.length !== 6 || loading}
        >
          Verify
        </Button>
        <button
          type="button"
          className="text-sm underline justify-self-start"
          onClick={resend}
          disabled={loading}
        >
          Resend code
        </button>
      </form>
    </FormScreen>
  );
}
