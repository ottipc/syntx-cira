// Focus & resonance field N06 (architecture v2.0.3, 03.6, 04.2–04.4). Generic over the view model: the view passes the
// focus id, its focusable ids, a pure resolver and a writer — this module imports nothing from views, contracts or
// session (G03.3 unchanged, C10). It emits `data-focus-scope` (the one bit R11 reads) and per-item focus states.
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useT } from "../../language";
import { FocusFrame } from "../primitives/FocusFrame";
import { ResonanceMark } from "../primitives/ResonanceMark";

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
    // Escape inside an open modal dialog belongs to the dialog, not to the focus field
    const k = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.querySelector('[role="dialog"][aria-modal="true"]')) onFocus(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [focus, onFocus]);
  // MOT14 focus carry (04.11): when the view mounts with a present target, or the target changes, bring it into view
  // (instant; the settle motion is added with the motion layer). Nothing moves when the target is absent.
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!active || focus === null) return;
    // focus is a StableId (K-01: [a-z0-9_.:/-]), so it needs no escaping inside a quoted attribute selector
    const el = root.current?.querySelector(`[data-focus-id="${focus}"]`);
    el?.scrollIntoView?.({ block: "nearest", inline: "nearest", behavior: "instant" });
  }, [active, focus]);
  const ctx = useMemo<Ctx>(() => ({
    active, focus,
    state: (id) => (!active ? undefined : id === focus ? "focused" : resonant.has(id) ? "resonant" : "attenuated"),
    toggle: (id) => onFocus(focus === id ? null : id),
  }), [active, focus, resonant, onFocus]);
  return (
    <FocusCtx.Provider value={ctx}>
      <div ref={root} className="focus-scope" data-focus-scope={active ? "active" : "idle"} onClick={active ? (e: MouseEvent) => { if (isEmpty(e.target)) onFocus(null); } : undefined}>
        {focus !== null && !present ? <p className="focus-absent" role="status" data-term="focus.absent">{t("focus.absent")} <span className="mono-id">{focus}</span></p> : null}
        {children}
      </div>
    </FocusCtx.Provider>
  );
}

/** A click on empty workspace clears the focus (04.2); clicks on items, controls and links never do. */
function isEmpty(t: EventTarget): boolean {
  return t instanceof Element && t.closest('[data-focus-id], button, a, input, select, textarea, label, summary, [role="tab"], [role="button"], [role="dialog"]') === null;
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

/** Attributes of a focusable item: `data-focus-id` (04.2 rule 1) and its state while a scope is active. */
export function useFocusItem(id: string): { state: FocusState | undefined; attrs: { "data-focus-id": string; "data-focus-state"?: FocusState } } {
  const state = useFocusState(id);
  return { state, attrs: { "data-focus-id": id, ...(state ? { "data-focus-state": state } : {}) } };
}

/** Frame elements of a box-shaped item: SEM-034 geometry when focused, SEM-038 when resonant (nothing otherwise).
 *  Place inside the host (for a table row: inside its first cell; the row is the positioned ancestor). */
export function FocusMarks({ id }: { id: string }) {
  const s = useFocusState(id);
  return s === "focused" ? <FocusFrame /> : s === "resonant" ? <ResonanceMark /> : null;
}

/** Handle props for an SVG item (view 02 nodes): keyboard- and pointer-operable like FocusHandle. */
export function useFocusHandle(id: string) {
  const c = useContext(FocusCtx);
  return {
    role: "button" as const, tabIndex: 0, "aria-pressed": c.focus === id, ...(c.state(id) === "focused" ? { "aria-current": "true" as const } : {}),
    onClick: () => c.toggle(id),
    onKeyDown: (e: ReactKeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.toggle(id); } },
  };
}
