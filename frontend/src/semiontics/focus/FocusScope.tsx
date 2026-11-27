// Focus & resonance field N06 (architecture v2.0.3, 03.6, 04.2–04.4). Generic over the view model: the view passes the
// focus id, its focusable ids, a pure resolver and a writer — this module imports nothing from views, contracts or
// session (G03.3 unchanged, C10). It emits `data-focus-scope` (the one bit R11 reads) and per-item focus states.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useT } from "../../language";

export type FocusState = "focused" | "resonant" | "attenuated";
interface Ctx { active: boolean; state: (id: string) => FocusState | undefined; toggle: (id: string) => void; focus: string | null }
const FocusCtx = createContext<Ctx>({ active: false, state: () => undefined, toggle: () => undefined, focus: null });

export interface FocusScopeProps<VM> {
  focus: string | null;
  vm: VM;
  ids: readonly string[];
  /** pure, deterministic, selection only (TX26): ids linked to `focus` by a documented field of the projection */
  resolveResonance: (focus: string, vm: VM) => readonly string[];
  onFocus: (id: string | null) => void;
  /** quarantine anywhere in the view suspends the scope (no attenuation) */
  suspended?: boolean;
  children: ReactNode;
}

export function FocusScope<VM>({ focus, vm, ids, resolveResonance, onFocus, suspended = false, children }: FocusScopeProps<VM>) {
  const t = useT();
  const present = focus !== null && ids.includes(focus);
  const active = present && !suspended;
  const resonant = useMemo(() => new Set(active && focus !== null ? resolveResonance(focus, vm).filter((x) => x !== focus && ids.includes(x)) : []),
    [active, focus, vm, ids, resolveResonance]);
  useEffect(() => {
    if (!focus) return undefined;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onFocus(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [focus, onFocus]);
  const ctx = useMemo<Ctx>(() => ({
    active, focus,
    state: (id) => (!active ? undefined : id === focus ? "focused" : resonant.has(id) ? "resonant" : "attenuated"),
    toggle: (id) => onFocus(focus === id ? null : id),
  }), [active, focus, resonant, onFocus]);
  return (
    <FocusCtx.Provider value={ctx}>
      <div className="focus-scope" data-focus-scope={active ? "active" : "idle"}>
        {focus !== null && !present ? <p className="focus-absent" role="status" data-term="focus.absent">{t("focus.absent")} <span className="mono-id">{focus}</span></p> : null}
        {children}
      </div>
    </FocusCtx.Provider>
  );
}

/** State of one focusable item inside the nearest scope (undefined = neutral). */
export function useFocusState(id: string): FocusState | undefined { return useContext(FocusCtx).state(id); }
export function useFocusScope(): Ctx { return useContext(FocusCtx); }

/** Keyboard- and pointer-operable focus handle (Enter/Space toggle, Escape clears via the scope). */
export function FocusHandle({ id, children }: { id: string; children: ReactNode }) {
  const c = useContext(FocusCtx);
  return (
    <button type="button" className="focus-handle" aria-pressed={c.focus === id} {...(c.state(id) === "focused" ? { "aria-current": "true" as const } : {})}
      onClick={() => c.toggle(id)}>{children}</button>
  );
}
