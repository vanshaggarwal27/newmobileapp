import { ReactNode, useMemo } from "react";
import { useI18n } from "@/context/i18n";

export default function T({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const text = useMemo(() => {
    const s =
      typeof children === "string"
        ? children
        : Array.isArray(children)
          ? children.join(" ")
          : String(children ?? "");
    return t(s);
  }, [children, t]);
  return <>{text}</>;
}
