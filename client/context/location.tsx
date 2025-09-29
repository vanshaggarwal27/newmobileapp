import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface Coords {
  lat: number;
  lon: number;
}
export interface LocationState {
  coords: Coords | null;
  cityLine: string | null; // e.g. "Melbourne, Victoria"
  loading: boolean;
  error: string | null;
  live: boolean;
  requestLocation: () => Promise<void>;
  startLive: () => Promise<void>;
  stopLive: () => void;
}

const LocationCtx = createContext<LocationState | null>(null);

const STORAGE_KEY = "app:location";
const PROMPT_FLAG = "app:promptLocation";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [cityLine, setCityLine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const watchId = React.useRef<number | null>(null);
  const lastGeocodeAt = React.useRef<number>(0);

  // Load last known location
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          coords?: Coords;
          cityLine?: string;
        };
        if (parsed.coords) setCoords(parsed.coords);
        if (parsed.cityLine) setCityLine(parsed.cityLine);
      }
    } catch {}
  }, []);

  const reverseGeocode = async (pos: Coords) => {
    try {
      const resp = await fetch(
        `/api/reverse-geocode?lat=${encodeURIComponent(pos.lat)}&lon=${encodeURIComponent(pos.lon)}`,
      );
      if (!resp.ok) return `${pos.lat.toFixed(3)}, ${pos.lon.toFixed(3)}`;
      const data = (await resp.json()) as { line?: string };
      return data.line || `${pos.lat.toFixed(3)}, ${pos.lon.toFixed(3)}`;
    } catch (e) {
      return `${pos.lat.toFixed(3)}, ${pos.lon.toFixed(3)}`;
    }
  };

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await new Promise<Coords>((resolve, reject) => {
        if (!("geolocation" in navigator))
          return reject(new Error("Geolocation not supported"));
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
        );
      });
      setCoords(coords);
      const line = await reverseGeocode(coords);
      setCityLine(line);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ coords, cityLine: line }),
      );
    } catch (e: any) {
      setError(e?.message || "Failed to get location");
    } finally {
      setLoading(false);
      localStorage.removeItem(PROMPT_FLAG);
    }
  }, []);

  const startLive = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }
    if (watchId.current != null) return; // already watching
    setLive(true);
    setLoading(true);
    watchId.current = navigator.geolocation.watchPosition(
      async (p) => {
        const pos = { lat: p.coords.latitude, lon: p.coords.longitude };
        setCoords(pos);
        const now = Date.now();
        if (!cityLine || now - lastGeocodeAt.current > 30000) {
          const line = await reverseGeocode(pos);
          setCityLine(line);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ coords: pos, cityLine: line }),
          );
          lastGeocodeAt.current = now;
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
  }, [cityLine]);

  const stopLive = useCallback(() => {
    if (watchId.current != null) {
      try {
        navigator.geolocation.clearWatch(watchId.current);
      } catch {}
      watchId.current = null;
    }
    setLive(false);
  }, []);

  // Auto prompt if requested by previous page
  useEffect(() => {
    const should = localStorage.getItem(PROMPT_FLAG) === "1";
    if (should) startLive();
  }, [startLive]);

  // Custom window event trigger (for places that don't have context)
  useEffect(() => {
    const handler = () => startLive();
    window.addEventListener("app:requestLocation", handler as any);
    return () =>
      window.removeEventListener("app:requestLocation", handler as any);
  }, [startLive]);

  const value = useMemo<LocationState>(
    () => ({
      coords,
      cityLine,
      loading,
      error,
      live,
      requestLocation,
      startLive,
      stopLive,
    }),
    [
      coords,
      cityLine,
      loading,
      error,
      live,
      requestLocation,
      startLive,
      stopLive,
    ],
  );

  return <LocationCtx.Provider value={value}>{children}</LocationCtx.Provider>;
}

export function useLocationState() {
  const ctx = useContext(LocationCtx);
  if (!ctx)
    throw new Error("useLocationState must be used within LocationProvider");
  return ctx;
}

export const locationStorage = {
  promptNext() {
    localStorage.setItem(PROMPT_FLAG, "1");
  },
};
