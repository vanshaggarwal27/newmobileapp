import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FormScreen from "@/components/auth/FormScreen";
import { db, serverTimestamp } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <FormScreen
      title="Your details"
      progress={30}
      bottom={
        <p className="text-xs text-muted-foreground">
          If you'd like to know more about how we collect, use and look after
          your personal information, please refer to our{" "}
          <a className="underline" href="#">
            Privacy Collection Notice
          </a>{" "}
          and{" "}
          <a className="underline" href="#">
            Privacy Policy
          </a>
          .
        </p>
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          const email = (fd.get("email") as string) || "";
          const first = String(fd.get("first") || "");
          const last = String(fd.get("last") || "");
          const phone = String(fd.get("phone") || "");

          // Persist pending profile to complete after verification
          try {
            localStorage.setItem(
              "app:pendingUser",
              JSON.stringify({ first, last, phone, email }),
            );
          } catch {}

          try {
            const res = await fetch("/api/auth/send-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, name: `${first} ${last}`.trim() }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.error || `HTTP ${res.status}`);
            }
            toast({
              title: "Verification sent",
              description: `Check ${email} for the 6-digit code.`,
            });
          } catch (err: any) {
            toast({
              title: "Failed to send email",
              description: String(err?.message ?? err),
            });
            return;
          }

          navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        }}
        className="grid gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="first">
              First Name<span className="text-destructive"> *</span>
            </label>
            <input
              id="first"
              name="first"
              required
              className="h-11 rounded-md border px-3"
              placeholder="First Name"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="last">
              Last Name<span className="text-destructive"> *</span>
            </label>
            <input
              id="last"
              name="last"
              required
              className="h-11 rounded-md border px-3"
              placeholder="Last Name"
            />
          </div>
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email address<span className="text-destructive"> *</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="h-11 rounded-md border px-3"
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium" htmlFor="phone">
            Mobile number<span className="text-destructive"> *</span>
          </label>
          <div className="flex">
            <select
              aria-label="Country code"
              className="h-11 rounded-l-md border px-2 text-sm bg-white"
            >
              <option value="AU">+61</option>
              <option value="US">+1</option>
              <option value="IN">+91</option>
            </select>
            <input
              id="phone"
              name="phone"
              required
              className="h-11 w-full rounded-r-md border border-l-0 px-3"
              placeholder="Mobile number"
            />
          </div>
          <a href="#" className="mt-1 text-xs underline">
            Why do you need my mobile number?
          </a>
        </div>
        <Button type="submit" className="h-12 rounded-full">
          Next
        </Button>
      </form>
    </FormScreen>
  );
}
