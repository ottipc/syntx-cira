// F07.3 Provenance — every block carries the header of its source; the drawer shows it (G03.1 P).
import { createContext, useContext, useState, type ReactNode } from "react";
import type { ArtifactRef, ProjectionHeader, StrategyRef } from "../contracts/generated/cira";
import type { TermKey } from "../language";

export interface Selection {
  title: TermKey;
  header: ProjectionHeader;
  refs?: readonly ArtifactRef[];
  strategies?: readonly StrategyRef[];
  raw?: unknown;
}
interface Ctx { selection: Selection | null; open: (s: Selection) => void; close: () => void }
const C = createContext<Ctx>({ selection: null, open: () => undefined, close: () => undefined });

export function ProvenanceProvider({ children }: { children: ReactNode }) {
  const [selection, setSel] = useState<Selection | null>(null);
  return <C.Provider value={{ selection, open: setSel, close: () => setSel(null) }}>{children}</C.Provider>;
}

export function useProvenance(): Ctx {
  return useContext(C);
}
