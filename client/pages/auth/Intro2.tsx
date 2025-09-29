import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { userStore } from "@/data/user";
import { toast } from "@/hooks/use-toast";

const IMG2 =
  "https://cdn.builder.io/api/v1/image/assets%2F9144d974659344579af7e37342ce7ad4%2F8feccd49e9cc4ccea26ccb93370d378c?format=webp&width=800";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.35 0 6.37 1.16 8.74 3.43l6.54-6.54C35.4 2.3 30.1 0 24 0 14.62 0 6.51 5.34 2.56 13.1l7.76 6.02C12.18 13.4 17.63 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24c0-1.5-.14-2.94-.41-4.33H24v8.2h12.7c-.55 2.98-2.23 5.5-4.74 7.19l7.26 5.64C43.93 36.9 46.5 30.96 46.5 24z"
      />
      <path
        fill="#FBBC05"
        d="M10.32 28.88A14.48 14.48 0 0 1 9.5 24c0-1.7.29-3.34.81-4.88l-7.76-6.02A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.77l7.76-5.89z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.26-5.64c-2.02 1.36-4.62 2.16-8.63 2.16-6.37 0-11.82-3.9-13.68-9.62l-7.76 5.89C6.51 42.66 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export default function Intro2() {
  const navigate = useNavigate();
  const onGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const uid = u.uid;
      const name = u.displayName || "";
      const [first, ...rest] = name.split(" ");
      const last = rest.join(" ").trim();
      await setDoc(
        doc(db, "users", uid),
        {
          user_id: uid,
          name,
          email: u.email || "",
          phone: u.phoneNumber || "",
          role: "citizen",
          joined_at: serverTimestamp(),
        },
        { merge: true },
      );
      userStore.save({
        id: uid,
        first,
        last,
        email: u.email || "",
        phone: u.phoneNumber || "",
        role: "citizen",
      });
      try {
        localStorage.setItem("app:promptLocation", "1");
      } catch {}
      toast({
        title: "Signed in",
        description: `Welcome${first ? `, ${first}` : ""}!`,
      });
      navigate("/");
    } catch (err: any) {
      toast({
        title: "Google sign-in failed",
        description: String(err?.message ?? err),
      });
    }
  };
  return (
    <div className="min-h-screen relative">
      <img
        src={IMG2}
        alt="Auth options"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex min-h-screen flex-col justify-end">
        <div className="mx-auto max-w-md w-full p-6 text-white">
          <h2 className="text-2xl font-bold text-center">Welcome</h2>
          <div className="mt-4 grid gap-3">
            <button
              onClick={onGoogle}
              className="h-12 w-full rounded-full bg-white text-black font-medium inline-flex items-center justify-center gap-2"
            >
              <GoogleIcon /> Continue with Google
            </button>
            <button
              onClick={() => navigate("/auth/login")}
              className="h-12 w-full rounded-full bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2"
            >
              <Mail className="size-5" /> Continue with Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
