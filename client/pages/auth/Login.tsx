import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import FormScreen from "@/components/auth/FormScreen";

export default function Login() {
  const navigate = useNavigate();

  return (
    <FormScreen title="Sign in" progress={10}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try { localStorage.setItem("app:promptLocation", "1"); } catch {}
          navigate("/");
        }}
        className="grid gap-4"
      >
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-medium">Email address<span className="text-destructive"> *</span></label>
          <input id="email" name="email" type="email" required className="h-11 rounded-md border px-3" placeholder="you@example.com" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="password" className="text-sm font-medium">Password<span className="text-destructive"> *</span></label>
          <input id="password" name="password" type="password" required className="h-11 rounded-md border px-3" placeholder="••••••••" />
        </div>
        <Button type="submit" className="h-12 rounded-full">Next</Button>
        <Button type="button" variant="secondary" className="h-12 rounded-full" onClick={() => navigate("/auth/phone")}>Use phone instead</Button>
      </form>
      <p className="text-center text-sm">New here? <button className="text-primary underline" onClick={() => navigate("/auth/signup")}>Create an account</button></p>
    </FormScreen>
  );
}
