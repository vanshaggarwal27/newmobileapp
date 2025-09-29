import { ReactNode } from "react";

export default function AuthLayout({ children, image }: { children: ReactNode; image: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        <div className="relative h-56 w-full overflow-hidden">
          <img src={image} alt="Auth hero" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-extrabold tracking-tight">Bettering shared spaces.</h1>
            <p className="text-sm opacity-90">Create an account to get started.</p>
          </div>
        </div>
        <div className="px-4 -mt-8">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
