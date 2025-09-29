import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import FormScreen from "@/components/auth/FormScreen";

export default function PhoneAuth() {
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <FormScreen title={step === "enter" ? "Sign in" : "Verification code"} progress={step === "enter" ? 10 : 50}
      bottom={
        step === "enter" ? (
          <p className="text-xs text-muted-foreground">We may use your number to verify your account.</p>
        ) : (
          <p className="text-xs text-muted-foreground">Didn\'t get a code? <button className="underline" onClick={() => setOtp("")}>Resend</button></p>
        )
      }
    >
      {step === "enter" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("code");
          }}
          className="grid gap-4"
        >
          <div className="grid gap-1">
            <label className="text-sm font-medium" htmlFor="phone">Mobile number<span className="text-destructive"> *</span></label>
            <div className="flex">
              <select aria-label="Country code" className="h-11 rounded-l-md border px-2 text-sm bg-white">
                <option value="AU">+61</option>
                <option value="US">+1</option>
                <option value="IN">+91</option>
              </select>
              <input id="phone" name="phone" value={phone} onChange={(e)=>setPhone(e.target.value)} required className="h-11 w-full rounded-r-md border border-l-0 px-3" placeholder="Mobile number" />
            </div>
            <a href="#" className="mt-1 text-xs underline">Why do you need my mobile number?</a>
          </div>
          <Button type="submit" className="h-12 rounded-full">Next</Button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try { localStorage.setItem("app:promptLocation", "1"); } catch {}
            window.location.href = "/";
          }}
          className="grid gap-4"
        >
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
          <Button type="submit" className="h-12 rounded-full">Verify</Button>
          <button type="button" className="text-sm underline justify-self-start" onClick={() => setStep("enter")}>Use a different number</button>
        </form>
      )}
    </FormScreen>
  );
}
