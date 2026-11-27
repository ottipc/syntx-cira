// View 11 ViewModel: two separate tracks — scenario events (F03) and pipeline stage events (K-35). No merge.
export type { EventsProjection } from "../../contracts/generated/cira";
import type { EventRecord, EventStatus, EventsProjection, InputEventKind, StageEvent, StageName } from "../../contracts/generated/cira";
import { TermMaps, type TermKey } from "../../language";
import type { SemId } from "../../semiontics";

export const EVENT_STATUS: Record<EventStatus, { sem: SemId; term: TermKey }> = {
  APPLIED: { sem: "SEM-010", term: "event.applied" }, REJECTED: { sem: "SEM-011", term: "event.rejected" } };
export const EVENT_KIND: Record<InputEventKind, TermKey> = { SET_ATTRIBUTE: "event.set_attribute", APPLY_APPROVAL: "event.apply_approval" };
export const STAGE_TERM: Record<StageName, TermKey> = {
  DEFINITIONS: "stage.definitions", EMULATION: "stage.emulation", OBSERVATION: "stage.observation", FORWARD: "stage.forward",
  INVERSE: "stage.inverse", MERGE: "stage.merge", STABILITY: "stage.stability", EVALUATION: "stage.evaluation", EXPORT: "stage.export" };

export function tracks(e: EventsProjection): { scenario: EventRecord[]; pipeline: StageEvent[] } {
  return { scenario: [...e.events].sort((a, b) => a.seq - b.seq), pipeline: [...e.stage_events].sort((a, b) => a.seq - b.seq) };
}

/** Error records are shown by code and recovery action from the catalog; the backend message stays in the
 *  technical record (INV-LANG-04). */
export function errorTerms(e: { code: string; recovery: string } | null | undefined): [TermKey, TermKey] | null {
  if (!e) return null;
  const code = (TermMaps.TERM_ErrorCodeC as Record<string, TermKey>)[e.code];
  const rec = (TermMaps.TERM_RecoveryAction as Record<string, TermKey>)[e.recovery];
  return code && rec ? [code, rec] : null;
}

/** View 11 resonance (04.4): `tick` of scenario events and pipeline stage events — an item resonates with the items of
 *  the same tick (both tracks; the tracks stay separate). Stage events carry no id; they are addressed as
 *  `pipeline:<seq>` (StableId form, K-01). Equality on ticks and ids only (TX26). */
export const stageEventId = (s: { seq: number }): string => `pipeline:${s.seq}`;
export interface ResonanceVM11 { items: readonly { id: string; tick: number | null }[] }
export function resonanceVM(e: EventsProjection): ResonanceVM11 {
  return { items: [...e.events.map((x) => ({ id: x.event_ref, tick: x.tick })), ...e.stage_events.map((s) => ({ id: stageEventId(s), tick: s.tick ?? null }))] };
}
export function resolveResonance(focus: string, vm: ResonanceVM11): readonly string[] {
  const f = vm.items.find((x) => x.id === focus);
  return f && f.tick !== null ? vm.items.filter((x) => x.id !== focus && x.tick === f.tick).map((x) => x.id) : [];
}
