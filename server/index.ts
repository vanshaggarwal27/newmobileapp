import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { aiDescribe } from "./routes/ai-describe";
import { reverseGeocode } from "./routes/reverse-geocode";
import { sendCode, verifyCode } from "./routes/auth-otp";
import { translate } from "./routes/translate";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  // Allow larger payloads for base64-encoded images/audio sent to AI endpoint
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/ai/describe", aiDescribe);
  app.post("/api/auth/send-code", sendCode);
  app.post("/api/auth/verify-code", verifyCode);
  app.post("/api/translate", translate);
  app.get("/api/reverse-geocode", reverseGeocode);

  return app;
}
