import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userStore } from "@/data/user";

const IMG1 =
  "https://cdn.builder.io/api/v1/image/assets%2F9144d974659344579af7e37342ce7ad4%2F8feccd49e9cc4ccea26ccb93370d378c?format=webp&width=800";

export default function Start() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = userStore.get();
    if (user && user.id) navigate("/");
  }, [navigate]);
  return (
    <div className="min-h-screen relative">
      <img
        src={IMG1}
        alt="Welcome"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 30%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 flex min-h-screen flex-col justify-end">
        <div className="mx-auto max-w-md w-full p-6 text-white">
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow">
            Nivaran
          </h1>
          <p className="mt-2 opacity-90 drop-shadow">
            Bettering shared issues. Create an account to get started today!
          </p>
          <button
            onClick={() => navigate("/auth/intro2")}
            className="mt-6 w-full h-12 rounded-full bg-white text-black font-medium shadow-lg"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}
