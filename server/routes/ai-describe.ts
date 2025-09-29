import type { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

function dataUrlToInlineData(dataUrl: string): {
  mimeType: string;
  data: string;
} {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL");
  }
  const mimeType = match[1];
  const data = match[2];
  return { mimeType, data };
}

export const aiDescribe: RequestHandler = async (req, res) => {
  try {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
      res.status(501).json({ error: "GOOGLE_API_KEY not configured" });
      return;
    }

    const { imageDataUrl, imageDataUrls, audioDataUrl, hint } = req.body as {
      imageDataUrl?: string;
      imageDataUrls?: string[];
      audioDataUrl?: string;
      hint?: string;
    };

    const genAI = new GoogleGenerativeAI(key);
    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-8b-latest",
      "gemini-1.5-flash",
    ].filter(Boolean) as string[];

    const allowed = ["Garbage","Pothole","Streetlight","Water","Sewage","Encroachment"];
    const parts: any[] = [
      {
        text:
          `You are helping a citizen report a civic issue. Based on the media, respond ONLY with strict JSON: {"description": string, "category": one of [${allowed.join(", ")}]}. ` +
          `Description must be 2-3 concise sentences, no PII. Category MUST be exactly one of the allowed values. If unsure, pick the closest.`,
      },
    ];

    const images: string[] = [];
    if (Array.isArray(imageDataUrls)) images.push(...imageDataUrls);
    if (imageDataUrl) images.push(imageDataUrl);
    const imgLimited = images.slice(0, 2);

    for (const img of imgLimited) {
      try {
        const inline = dataUrlToInlineData(img);
        parts.push({ inlineData: inline });
      } catch {}
    }
    if (audioDataUrl) {
      try {
        const inline = dataUrlToInlineData(audioDataUrl);
        parts.push({ inlineData: inline });
      } catch {}
    }
    if (hint && typeof hint === "string" && hint.trim()) {
      parts.push({ text: `User notes: ${hint.trim()}` });
    }

    let lastErr: any = null;
    for (const m of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent({ contents: [{ role: "user", parts }] });
        const raw = result.response.text();
        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          const match = raw.match(/\{[\s\S]*\}/);
          if (match) {
            try { parsed = JSON.parse(match[0]); } catch {}
          }
        }
        let description = String(parsed?.description || raw || "").trim();
        let category = String(parsed?.category || "").trim();
        if (!allowed.includes(category)) {
          const low = (description + " " + category).toLowerCase();
          if (/pothole|asphalt|road hole/.test(low)) category = "Pothole";
          else if (/street ?light|lamp|light pole/.test(low)) category = "Streetlight";
          else if (/sewage|sewer|drain/.test(low)) category = "Sewage";
          else if (/garbage|trash|litter|dump/.test(low)) category = "Garbage";
          else if (/water|leak|pipe/.test(low)) category = "Water";
          else if (/encroach/.test(low)) category = "Encroachment";
          else category = "Garbage";
        }
        return res.json({ description, category });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("AI failed");
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "AI error" });
  }
};
