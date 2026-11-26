import { useEffect, useState, type ReactNode } from "react";
import { useT } from "../language";

/** Minimum viewport 1280 × 720 (G03.10): below it a notice instead of a broken layout. */
export function ViewportGuard({ children }: { children: ReactNode }) {
  const t = useT();
  const read = () => (typeof window === "undefined" ? true : window.innerWidth >= 1280 && window.innerHeight >= 720);
  const [ok, setOk] = useState(read);
  useEffect(() => {
    const on = () => setOk(read());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return ok ? <>{children}</> : <div className="viewport-guard"><p>{t("msg.viewport")}</p></div>;
}
