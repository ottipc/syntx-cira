// View 11 ViewModel: two separate tracks — scenario events (F03) and pipeline stage events (K-35). No merge.
export type { EventsProjection } from "../../contracts/generated/cira";
import type { EventRecord, EventStatus, EventsProjection, InputEventKind, StageEvent, StageName } from "../../contracts/generated/cira";
import type { TermKey } from "../../language";
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
