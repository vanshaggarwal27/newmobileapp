import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { settingsStore } from "@/data/user";

export type LangCode =
  | "en"
  | "hi"
  | "bn"
  | "pa"
  | "ta"
  | "te"
  | "mr"
  | "gu"
  | "ur"
  | "zh";

type Dict = Record<string, string>;

interface I18nContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (s: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "app:translations";

function loadCache(): Record<string, Dict> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, Dict>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const initial =
    (settingsStore.get()?.language as LangCode) ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("app:language") as LangCode)
      : "en") ||
    "en";
  const [lang, setLangState] = useState<LangCode>(initial);
  const [cache, setCache] = useState<Record<string, Dict>>(() => loadCache());

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    const s = settingsStore.get();
    settingsStore.save({ ...s, language: lang });
    try {
      localStorage.setItem("app:language", lang);
    } catch {}
  }, [lang]);

  const setLang = useCallback((l: LangCode) => setLangState(l), []);

  const translateBatch = useCallback(
    async (phrases: string[], target: LangCode): Promise<Dict> => {
      if (target === "en" || phrases.length === 0) return {};
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: phrases, target }),
      });
      if (!res.ok) return {};
      const data = (await res.json()) as { translations: string[] };
      const out: Dict = {};
      phrases.forEach((p, i) => {
        out[p] = data.translations[i] ?? p;
      });
      return out;
    },
    [],
  );

  const t = useCallback(
    (s: string) => {
      if (!s) return s;
      if (lang === "en") return s;
      const bucket = cache[lang] || {};
      const existing = bucket[s];
      if (existing) return existing;
      // schedule translation
      void (async () => {
        const upd = await translateBatch([s], lang);
        if (Object.keys(upd).length) {
          setCache((prev) => {
            const next = { ...prev, [lang]: { ...(prev[lang] || {}), ...upd } };
            saveCache(next);
            return next;
          });
        }
      })();
      return s;
    },
    [lang, cache, translateBatch],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
