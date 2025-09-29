import Index from "./Index";
import { Navigate } from "react-router-dom";
import { userStore } from "@/data/user";

export default function Home() {
  const user = userStore.get();
  if (user && user.id) return <Index />;
  return <Navigate to="/auth/start" replace />;
}
