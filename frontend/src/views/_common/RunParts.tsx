// Shared parts of views 05/06 (same sub-field F07.7): run header, trace timeline, output tabs.
import { useState } from "react";
import type { SweepOutput, SweepRun, TraceProjection } from "./model";
import { useT, type TermKey } from "../../language";
import { EngineToken, EpistemicChip, ExecPill, FocusHandle, GapMark, IdText, OriginBadge, SpaceCell, TerminationSeal } from "../../semiontics";
import { FocusBox, FocusIdCell, FocusTr } from "./FocusParts";

export function RunHeader({ run, origin, title, children }: { run: SweepRun; origin: string; title: TermKey; children?: React.ReactNode }) {
  const t = useT();
  const adapterTerm: Record<string, TermKey> = { FIXTURE: "adapter.fixture", LOCAL: "adapter.local", API: "adapter.api", IMPORT: "adapter.import" };
  return (
    <div className="stack">
      <div className="view-head"><h1 className="view-title">{t(title)}</h1><IdText>{run.sweep_id}</IdText>
        <ExecPill status={run.execution_status} /><OriginBadge origin={origin} /></div>
      <div className="row secondary">
        <span>{t("run.adapter")}</span><IdText>{run.adapter.adapter_id}</IdText><span>({t(adapterTerm[run.adapter.kind] ?? "adapter.fixture")})</span>
        {children}<span>· {t("run.context")}</span><IdText>{run.context_version}</IdText>
      </div>
      {run.termination ? <div className="row"><span className="secondary">{t("term.label")}</span>
        <TerminationSeal reason={run.termination.reason} steps={run.termination.steps_executed} /></div> : null}
    </div>
  );
}

export function TraceTimeline({ tr, independentNote }: { tr: TraceProjection; independentNote?: boolean }) {
  const t = useT();
  const labels = new Map(tr.registry_labels.map((x) => [x[0], x[1]] as const));
  const steps = tr.trace.content?.steps ?? [];
  return (
    <div className="panel"><h2 className="section-title">{t("engine.trace")}{independentNote ? ` (${t("engine.trace.independent")})` : ""}</h2>
      <ol className="stack">
        {steps.map((s) => {
          const op = s.operator_ref;
          const opDatum = op ? ("symbol" in op ? op.symbol : op.code) : null;
          const opKey = op ? `${op.namespace}:${opDatum ?? ""}:${op.registry_version}` : null;
          const sig = s.sigma_ref;
          return (
            <FocusBox as="li" key={s.step_id} id={s.step_id} data-step={s.step_id} className="stack">
              <div className="row"><FocusHandle id={s.step_id}><IdText>{`#${s.step_seq}`}</IdText></FocusHandle><EpistemicChip cls={s.epistemic_class} /></div>
              {sig ? <EngineToken kind="field" datum={sig.sigma_id} label={labels.get(`SIGMA:${sig.sigma_id}:${sig.registry_version}`) ?? null} /> : null}
              {op && opDatum ? <EngineToken kind="operator" datum={opDatum} label={opKey ? labels.get(opKey) ?? null : null} opaque={"code" in op} /> : null}
            </FocusBox>
          );
        })}
      </ol>
    </div>
  );
}

const TABS: readonly ["values" | "relations" | "gaps" | "open", TermKey][] = [["values", "ui.values"], ["relations", "ui.relations"], ["gaps", "ui.gaps"], ["open", "ui.open_relations"]];

export function OutputTabs({ out }: { out: SweepOutput }) {
  const t = useT();
  const [tab, setTab] = useState<"values" | "relations" | "gaps" | "open">("values");
  return (
    <div className="panel"><h2 className="section-title">{t("ui.output")}</h2>
      <div className="toolbar" role="tablist">{TABS.map(([k, term]) => (
        <button key={k} type="button" role="tab" className="chip" aria-selected={tab === k} onClick={() => setTab(k)} data-term={term}>{t(term)}</button>))}</div>
      {tab === "values" ? <table className="data"><tbody>{out.values.map((v) => (
        <FocusTr key={v.attribute_ref} id={v.attribute_ref}><FocusIdCell id={v.attribute_ref} />
          <td><SpaceCell sem={v.status === "DETERMINED" ? "SEM-003" : v.status === "NOT_APPLICABLE" ? "SEM-008" : "SEM-007"} space="R"
            value={v.value ?? null} term={v.status === "DETERMINED" ? null : v.status === "NOT_APPLICABLE" ? "app.na" : "rec.undetermined"}
            sub={v.epistemic_class ? <EpistemicChip cls={v.epistemic_class} /> : null} /></td></FocusTr>))}</tbody></table> : null}
      {tab === "relations" ? <table className="data"><tbody>{(out.relations ?? []).map((r) => (
        <tr key={r.relation_key} data-sem="SEM-037"><td><IdText>{r.relation_key}</IdText></td><td>{t(r.coupling_status === "EFFECTIVE" ? "cpl.effective" : r.coupling_status === "POSSIBLE" ? "cpl.possible" : "cpl.unknown_open")}</td>
          <td><EpistemicChip cls={r.epistemic_class} /></td></tr>))}</tbody></table> : null}
      {tab === "gaps" ? <table className="data"><tbody>{(out.gaps ?? []).map((g) => (
        <tr key={g.gap_id}><td><IdText>{g.gap_id}</IdText></td><td><GapMark status={g.status} sources={g.source_refs.length} /></td>
          <td><IdText>{g.kind}</IdText></td></tr>))}</tbody></table> : null}
      {tab === "open" ? <table className="data"><tbody>{(out.open_relations ?? []).map((o) => (
        <tr key={o.relation_key}><td><IdText>{o.relation_key}</IdText></td><td className="secondary">{o.reason}</td></tr>))}</tbody></table> : null}
    </div>
  );
}
