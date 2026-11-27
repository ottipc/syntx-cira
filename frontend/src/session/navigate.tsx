import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { parseSession, sessionUrl, type SessionKey } from "./params";

interface Nav { session: SessionKey; go: (patch: Partial<SessionKey>) => void; goUrl: (url: string) => void;
  /** focus writes replace the history entry, so Back still means "previous view" (architecture v2.0.3, K9, 05.8) */
  setFocus: (focus: string | null) => void }
const Ctx = createContext<Nav | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const read = () => parseSession(window.location.pathname, window.location.search);
  const [session, setSession] = useState<SessionKey>(read);
  useEffect(() => {
    const on = () => setSession(read());
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  const goUrl = useCallback((url: string) => {
    window.history.pushState(null, "", url);
    setSession(read());
  }, []);
  const go = useCallback((patch: Partial<SessionKey>) => {
    goUrl(sessionUrl({ ...read(), ...patch }));
  }, [goUrl]);
  const setFocus = useCallback((focus: string | null) => {
    window.history.replaceState(null, "", sessionUrl({ ...read(), focus }));
    setSession(read());
  }, []);
  return <Ctx.Provider value={{ session, go, goUrl, setFocus }}>{children}</Ctx.Provider>;
}

export function useSession(): Nav {
  const v = useContext(Ctx);
  if (v === null) throw new Error("SessionProvider missing");
  return v;
}
