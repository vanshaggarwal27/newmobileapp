import type { RequestHandler } from "express";

export const translate: RequestHandler = async (req, res) => {
  try {
    const key = process.env.GOOGLE_API_KEY;
    if (!key)
      return res.status(501).json({ error: "GOOGLE_API_KEY not configured" });
    const { q, target } = req.body as { q?: string[]; target?: string };
    if (!Array.isArray(q) || !target)
      return res.status(400).json({ error: "Missing q or target" });

    const body = { q, target, format: "text", source: "en" } as any;
    const resp = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!resp.ok) {
      const txt = await resp.text();
      return res
        .status(500)
        .json({
          error: `Translate API ${resp.status}`,
          details: txt?.slice(0, 200),
        });
    }
    const data = (await resp.json()) as any;
    const translations: string[] = (data.data?.translations || []).map(
      (t: any) => t.translatedText || "",
    );
    res.json({ translations });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Translate error" });
  }
};
