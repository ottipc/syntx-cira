// F07.3 Provenance — selection state and header model (G03.1 P). Rendering in Zone E belongs to Shell, because
// G03.3 lets Provenance import only Session and Access (IC-10). `title` is a term key chosen by the caller.
import { createContext, useContext, useState, type ReactNode } from "react";
import type { ArtifactRef, ProjectionHeader, StrategyRef } from "../contracts/generated/cira";

export interface Selection {
  title: string;
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
