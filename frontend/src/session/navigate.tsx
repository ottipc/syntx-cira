import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { parseSession, sessionUrl, type SessionKey } from "./params";

interface Nav { session: SessionKey; go: (patch: Partial<SessionKey>) => void; goUrl: (url: string) => void }
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
  return <Ctx.Provider value={{ session, go, goUrl }}>{children}</Ctx.Provider>;
}

export function useSession(): Nav {
  const v = useContext(Ctx);
  if (v === null) throw new Error("SessionProvider missing");
  return v;
}
