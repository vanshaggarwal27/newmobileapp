import type { RequestHandler } from "express";

export const reverseGeocode: RequestHandler = async (req, res) => {
  try {
    const lat = req.query.lat || req.body.lat;
    const lon = req.query.lon || req.body.lon;
    if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "NivaranApp/1.0 (contact@nivaran.tech)",
        Accept: "application/json",
      },
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return res.status(502).json({ error: "OSM error", details: txt });
    }
    const data = await resp.json();
    const city =
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.suburb ||
      data?.address?.county ||
      "";
    const state = data?.address?.state || data?.address?.region || "";
    const line = [city, state].filter(Boolean).join(", ");
    res.json({ line: line || "" });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "reverse error" });
  }
};
