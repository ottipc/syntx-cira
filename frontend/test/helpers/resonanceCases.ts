// Resonance cases per view (architecture v2.0.3, 04.4) for V3T06/V2T20: the focusable ids of each view at the URL the
// browser test opens, the resolver under test, and an oracle that reads the documented relation field from raw JSON.
import * as v01 from "../../src/views/01-overview/model";
import * as v02 from "../../src/views/02-topology/model";
import * as v03 from "../../src/views/03-state/model";
import * as v04 from "../../src/views/04-observation/model";
import * as run from "../../src/views/_common/model";
import * as v07 from "../../src/views/07-gaps/model";
import * as v08 from "../../src/views/08-closure/model";
import * as v09 from "../../src/views/09-metrics/model";
import * as v10 from "../../src/views/10-comparison/model";
import * as v11 from "../../src/views/11-timeline/model";
import { CMP, EXP, snapshot } from "./snapshots";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type J = any;
export const b = EXP.baseline;
const X = (p: string) => `/experiments/${b}${p}`;

export interface Case { view: string; key: string; query: string; ids: string[]; resolve: (f: string) => readonly string[]; linked: (f: string, r: string) => boolean; nonEmpty: boolean }

export const resonanceCases = (): Case[] => {
  const fields = snapshot<J>(`/fields?experiment_id=${b}&tick=3`);
  const fStages = (f: string): string[] => (fields.manifests.find((m: J) => `field:${m.field_id.toLowerCase()}` === f)?.stage_status ?? []).map((x: J) => `stage:${x[0].toLowerCase()}`);
  const vm01 = v01.resonanceVM(fields);

  const tp = snapshot<J>(X("/topology")).topology;
  const vm02 = v02.resonanceVM(tp);

  const gov = ["A", "O", "R"].map((s) => snapshot<J>(X(`/governance?tick=3&space=${s}`)).evaluations.content);
  const vm03 = v03.resonanceVM(gov);
  const st = snapshot<J>(X("/states?tick=3"));

  const ob = snapshot<J>(X("/observations?tick=3")).observation.content;
  const vm04 = v04.resonanceVM(v04.rows(ob));

  const trF = snapshot<J>(X("/results/sweep:fwd:t3:a0/trace"));
  const fwd = snapshot<J>(X("/results?tick=3&attempt=0&direction=forward")).forward.content;
  const vm05 = run.runResonanceVM(trF);
  const trI = snapshot<J>(X("/results/sweep:inv:t3:a0/trace"));
  const inv = snapshot<J>(X("/results?tick=3&attempt=0&direction=inverse")).inverse.content;
  const vm06 = run.runResonanceVM(trI, inv.target_assessment);
  const stepOf = (tr: J, id: string) => tr.trace.content.steps.find((s: J) => s.step_id === id);
  const runLinked = (tr: J, goals: J[]) => (f: string, r: string): boolean => {
    const touches = (s: J, ids: string[]) => ids.some((x) => s.input_refs.includes(x) || s.output_refs.includes(x));
    const g = goals.find((x) => x.goal_id === f);
    if (g) return tr.trace.content.steps.some((s: J) => touches(s, g.derived_from ?? []) && (s.step_id === r || s.output_refs.includes(r)));
    const s = stepOf(tr, f);
    if (s) return s.output_refs.includes(r) || goals.some((x) => x.goal_id === r && touches(s, x.derived_from ?? []));
    return stepOf(tr, r)?.output_refs.includes(f) ?? false;
  };

  const mt = snapshot<J>(X("/metrics?aggregation=POOLED"));
  const merged = snapshot<J>(X("/results?tick=3&attempt=0&direction=merged")).reconstruction.content;
  const gaps07 = v07.openGaps(merged.output.gaps);
  const vm07 = v07.resonanceVM(mt, gaps07);

  const r8 = snapshot<J>(X("/results?tick=5&attempt=1&direction=merged"));
  const c8 = r8.reconstruction.content;
  const vm08 = v08.resonanceVM(r8.proposals, c8.output.gaps, c8.merge.conflicts);
  const subj = (id: string): string[] | null => r8.proposals.find((p: J) => p.proposal_id === id)?.subject_refs
    ?? c8.output.gaps.find((g: J) => g.gap_id === id)?.subject_refs ?? null;

  const vm09 = v09.resonanceVM(mt);
  const card = (k: string) => vm09.cards.find((c) => c.key === k)!;

  const cmp = snapshot<J>(`/comparisons/${CMP}`).comparison;
  const bs = v10.buckets(cmp);
  const vm10 = v10.resonanceVM(bs);
  const bucketOf = (k: string) => bs.filter((x) => x.items.map(v10.entryFocusId).includes(k)).map((x) => x.term);

  const ev = snapshot<J>(X("/events"));
  const vm11 = v11.resonanceVM(ev);
  const tickOf = (id: string): number | null | undefined => ev.events.find((e: J) => e.event_ref === id)?.tick
    ?? ev.stage_events.find((s: J) => v11.stageEventId(s) === id)?.tick;

  return [
    { view: "01", key: "SYSTEM_FIELD_OVERVIEW", query: `tick=3`, ids: [...fields.manifests.map((m: J) => `field:${m.field_id.toLowerCase()}`), ...v01.STAGES.map(v01.stageId)], nonEmpty: true,
      resolve: (f) => v01.resolveResonance(f, vm01), linked: (f, r) => fStages(f).includes(r) || fStages(r).includes(f) },
    { view: "02", key: "TOPOLOGY_GRAPH", query: `tick=3`, ids: [...tp.nodes.map((n: J) => n.node_id), ...tp.relations.map((r: J) => r.relation_id)], nonEmpty: true,
      resolve: (f) => v02.resolveResonance(f, vm02),
      linked: (f, r) => tp.relations.some((x: J) => (x.relation_id === f && (x.source === r || x.target === r)) || (x.relation_id === r && (x.source === f || x.target === f))
        || (x.source === f && x.target === r) || (x.target === f && x.source === r)) },
    { view: "03", key: "TEMPORAL_STATE_EXPLORER", query: `tick=3`, ids: st.values.map((v: J) => v.attribute_ref), nonEmpty: true,
      resolve: (f) => v03.resolveResonance(f, vm03),
      linked: (f, r) => gov.some((g: J) => (g?.evaluations ?? []).some((e: J) => e.input_attribute_refs.includes(f) && e.input_attribute_refs.includes(r))) },
    { view: "04", key: "OBSERVATION_INSPECTOR", query: `tick=3`, ids: [...ob.context.observations.map((o: J) => o.observation_id), ...ob.source_register.entries.map((e: J) => e.source_id)], nonEmpty: true,
      resolve: (f) => v04.resolveResonance(f, vm04),
      linked: (f, r) => ob.context.observations.some((o: J) => (o.observation_id === f && o.source_id === r) || (o.observation_id === r && o.source_id === f)) },
    { view: "05", key: "FORWARD_SWEEP_INSPECTOR", query: `tick=3`, ids: [...trF.trace.content.steps.map((s: J) => s.step_id), ...fwd.output.values.map((v: J) => v.attribute_ref)], nonEmpty: true,
      resolve: (f) => run.resolveRunResonance(f, vm05), linked: runLinked(trF, []) },
    { view: "06", key: "INVERSE_SWEEP_INSPECTOR", query: `tick=3`, ids: [...inv.target_assessment.map((g: J) => g.goal_id), ...trI.trace.content.steps.map((s: J) => s.step_id), ...inv.output.values.map((v: J) => v.attribute_ref)],
      nonEmpty: true, resolve: (f) => run.resolveRunResonance(f, vm06), linked: runLinked(trI, inv.target_assessment) },
    { view: "07", key: "STRUCTURAL_GAP_INSPECTOR", query: `tick=3`, ids: [...mt.report.gap_matches.map(v07.caseRowId), ...gaps07.map((g) => g.gap_id)], nonEmpty: true,
      resolve: (f) => v07.resolveResonance(f, vm07),
      linked: (f, r) => mt.report.gap_matches.some((g: J) => (g.case_id === f && g.gap_id === r) || (g.gap_id === f && g.case_id === r))
        || gaps07.some((g) => g.gap_id === f && g.source_refs.includes(r)) },
    { view: "08", key: "ARCHITECTURAL_CLOSURE_INSPECTOR", query: `tick=5&attempt=1`, ids: [...r8.proposals.map((p: J) => p.proposal_id), ...c8.output.gaps.map((g: J) => g.gap_id), ...c8.merge.conflicts.map((x: J) => x.attribute_ref)],
      nonEmpty: r8.proposals.length > 0 && c8.output.gaps.length > 0,
      resolve: (f) => v08.resolveResonance(f, vm08),
      linked: (f, r) => { const a = subj(f), c = subj(r); return (a !== null && c !== null && a.some((x) => c.includes(x))) || (a?.includes(r) ?? false) || (c?.includes(f) ?? false); } },
    { view: "09", key: "STRUCTURAL_METRICS", query: `tick=3`, ids: vm09.cards.map((c) => c.key), nonEmpty: true, resolve: (f) => v09.resolveResonance(f, vm09),
      linked: (f, r) => card(f).space === card(r).space || [card(f).id, card(r).id].sort().join() === "M01,M11" },
    { view: "10", key: "SCENARIO_COMPARISON", query: `tick=3&comparisonId=${encodeURIComponent(CMP)}`, ids: bs.flatMap((x) => x.items.map(v10.entryFocusId)), nonEmpty: false, resolve: (f) => v10.resolveResonance(f, vm10),
      linked: (f, r) => f.split("/")[0] === r.split("/")[0] && bucketOf(f).join() !== bucketOf(r).join() },
    { view: "11", key: "EVENT_TIMELINE", query: `tick=3`, ids: vm11.items.map((x) => x.id), nonEmpty: true, resolve: (f) => v11.resolveResonance(f, vm11),
      linked: (f, r) => tickOf(f) !== null && tickOf(f) !== undefined && tickOf(f) === tickOf(r) },
  ];
};

