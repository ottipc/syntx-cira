// TX15 / TX19 / T09 — DOM render of all eleven views against real projection snapshots (AK-GUI-01, -03…-07, AK-16a).
// Oracles are independent of view code: expected signs come from snapshot data + register bindings (sem-cases.json).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VIEW_IDS } from "../../src/session";
import { CASES, allowedIn, ORIGIN_SEM, semFor, semForFlag } from "../helpers/register";
import { renderAt, sems, workspace } from "../helpers/render";
import { CMP, EXP, snapshot } from "../helpers/snapshots";
import { TERMS } from "../../src/language";

type J = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const VIEW_NO = Object.fromEntries(VIEW_IDS.map((v, i) => [v, i + 1])) as Record<string, number>;
const url = (exp: string, view: string, q: string) => `/exp/${exp}/${view}?${q}`;
const GLOBAL = new Set(["SEM-028", "SEM-033", "SEM-036"]);

let errors: string[] = [];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => { errors.push(a.map(String).join(" ")); });
});
afterEach(() => vi.restoreAllMocks());

describe("[TX15][TX19][AK-GUI-01][REQ-054] eleven views render against snapshots", () => {
  const cases: [string, string, string][] = [];
  for (const exp of ["baseline", "recovery", "blocked", "sparse"] as const) {
    for (const tick of [0, 2, 3, 5]) {
      for (const v of VIEW_IDS) cases.push([exp, v, `tick=${tick}${v === "SCENARIO_COMPARISON" ? `&comparisonId=${encodeURIComponent(CMP)}` : ""}`]);
    }
  }
  it.each(cases)("[TX15][TX19] %s %s ?%s — no misses, no console errors, no quarantine, signs allowed by register", async (exp, view, q) => {
    const r = await renderAt(url(EXP[exp as keyof typeof EXP], view, q));
    const w = workspace(r.root);
    expect(r.server.misses, "every request answered by a snapshot").toEqual([]);
    expect(r.server.posts, "views never POST").toEqual([]);
    expect(errors, "0 console errors").toEqual([]);
    expect(w.querySelectorAll('[data-sem="SEM-028"]').length, "no quarantine on consistent data").toBe(0);
    expect(w.querySelectorAll('[data-state="READY"]').length, "at least one verified block").toBeGreaterThan(0);
    const allowed = allowedIn(VIEW_NO[view]!);
    const foreign = [...new Set(sems(w))].filter((s) => !allowed.has(s) && !GLOBAL.has(s));
    expect(foreign, `signs not registered for view ${VIEW_NO[view]}`).toEqual([]);
  });
});

describe("[TX19][AK-GUI-03][REQ-057] origin capsule on data blocks", () => {
  it.each(VIEW_IDS.filter((v) => v !== "SCENARIO_COMPARISON"))("[TX19] %s shows the origin of its projections", async (view) => {
    const r = await renderAt(url(EXP.baseline, view, "tick=3"));
    const w = workspace(r.root);
    const origins = new Set(sems(w).filter((s) => CASES[s]?.primitive === "OriginBadge"));
    expect(origins.size).toBeGreaterThan(0);
    for (const s of origins) expect(["SEM-013", "SEM-014", "SEM-015", "SEM-016", "SEM-017"]).toContain(s);
  });
  it("[TX19][AK-09] FIXTURE results are marked as test fixture wherever reconstruction data is shown", async () => {
    for (const view of ["FORWARD_SWEEP_INSPECTOR", "INVERSE_SWEEP_INSPECTOR", "STRUCTURAL_METRICS", "TEMPORAL_STATE_EXPLORER"]) {
      const r = await renderAt(url(EXP.baseline, view, "tick=3"));
      expect(sems(workspace(r.root)), view).toContain(ORIGIN_SEM("FIXTURE"));
    }
  });
  it("[TX19] the context bar shows the experiment origin from the server", async () => {
    const r = await renderAt(url(EXP.blocked, "SYSTEM_FIELD_OVERVIEW", "tick=0"));
    const x = snapshot<J>(`/experiments/${EXP.blocked}`).experiment;
    const bar = r.root.querySelector('[data-zone="A"]');
    expect(bar?.querySelector(`[data-sem="${ORIGIN_SEM(x.data_origin)}"]`)).not.toBeNull();
  });
});

describe("[TX19][T09] view 03 cells carry the sign of their contract state", () => {
  it.each([["baseline", 0], ["baseline", 3], ["baseline", 5], ["sparse", 2], ["sparse", 3], ["blocked", 1]] as const)(
    "[TX19][T09] %s t=%i", async (exp, tick) => {
      const e = EXP[exp];
      const r = await renderAt(url(e, "TEMPORAL_STATE_EXPLORER", `tick=${tick}`));
      const st = snapshot<J>(`/experiments/${e}/states?tick=${tick}`);
      const ob = snapshot<J>(`/experiments/${e}/observations?tick=${tick}`).observation;
      const rs = snapshot<J>(`/experiments/${e}/results?tick=${tick}&attempt=0&direction=merged`).reconstruction;
      const proj = new Map<string, J>(ob.content.projected.map((p: J) => [p.attribute_ref, p]));
      const vis = new Set<string>(ob.content.visible_nodes);
      const recv = new Map<string, J>((rs.content?.output.values ?? []).map((v: J) => [v.attribute_ref, v]));
      for (const v of st.values) {
        const row = r.root.querySelector(`[data-attribute="${v.attribute_ref}"]`);
        expect(row, v.attribute_ref).not.toBeNull();
        const a = row!.querySelector(".cell-a")!.getAttribute("data-sem");
        expect(a).toBe(semFor("*", "Applicability", v.applicability));
        const node = `node:${v.attribute_ref.slice(5).split("/")[0]}`;
        const p = proj.get(v.attribute_ref);
        const o = row!.querySelector(".cell-o")!.getAttribute("data-sem");
        const expO = !vis.has(node) ? semForFlag("SpaceCell", "Node.outside_theta")
          : p?.status === "KNOWN" && p.stale ? semForFlag("SpaceCell", "ProjectedValue.stale")
            : semFor("SpaceCell", "ObservationStatus", p?.status ?? "UNKNOWN");
        expect(o, `${v.attribute_ref} Ω_O`).toBe(expO);
        const rc = row!.querySelector(".cell-r")!.getAttribute("data-sem");
        const expR = rs.availability !== "AVAILABLE" ? semFor("SpaceCell", "ContentAvailability", rs.availability)
          : semFor("*", "ReconstructionStatus", recv.get(v.attribute_ref)?.status ?? "UNDETERMINED");
        expect(rc, `${v.attribute_ref} Ω_R`).toBe(expR);
        if (o === semFor("SpaceCell", "ObservationStatus", "KNOWN")) expect(row!.querySelector(".cell-o")!.textContent).toContain(p.value);
        if (a === "SEM-001") expect(row!.querySelector(".cell-a")!.textContent).toContain(v.value);
      }
    });

  it("[TX19][AK-GUI-05] non-sweep tick: Ω_R 'No reconstruction at t', Ω_A and Ω_O complete", async () => {
    const r = await renderAt(url(EXP.sparse, "TEMPORAL_STATE_EXPLORER", "tick=2"));
    const st = snapshot<J>(`/experiments/${EXP.sparse}/states?tick=2`);
    const rows = r.root.querySelectorAll("[data-attribute]");
    expect(rows.length).toBe(st.values.length);
    for (const row of rows) {
      expect(row.querySelector(".cell-r")!.getAttribute("data-sem")).toBe("SEM-009");
      expect(row.querySelector(".cell-r")!.getAttribute("data-term")).toBe("avail.none");
      expect(row.querySelector(".cell-r")!.textContent).toContain(TERMS["avail.none"].en.replace("{t}", "2"));
      expect(row.querySelector(".cell-a")).not.toBeNull();
      expect(row.querySelector(".cell-o")).not.toBeNull();
    }
    expect(workspace(r.root).querySelectorAll('[data-sem="SEM-028"]').length).toBe(0);
  });
});

describe("[TX19] cross-view focus (SEM-034)", () => {
  it("[TX19] the focused attribute of view 03 carries the focus sign, and only that one", async () => {
    const a = "attr:n05/state";
    const r = await renderAt(url(EXP.baseline, "TEMPORAL_STATE_EXPLORER", `tick=2&focus=${encodeURIComponent(a)}`));
    const marks = [...workspace(r.root).querySelectorAll('[data-sem="SEM-034"]')];
    expect(marks.length).toBe(1);
    expect(marks[0]!.closest("[data-attribute]")?.getAttribute("data-attribute")).toBe(a);
  });
});

describe("[TX22] decoration carries no statement", () => {
  it("[TX22] brand mark and neural field are hidden from assistive technology and carry no sign", async () => {
    const r = await renderAt(url(EXP.baseline, "SYSTEM_FIELD_OVERVIEW", "tick=0"));
    const mark = r.root.querySelector(".brand-mark");
    expect(mark?.getAttribute("alt")).toBe("");
    expect(mark?.getAttribute("aria-hidden")).toBe("true");
    const nf = r.root.querySelector(".neural-field");
    expect(nf?.getAttribute("aria-hidden")).toBe("true");
    expect(nf?.querySelector("[data-sem]")).toBeNull();
    expect(r.root.querySelectorAll(".chain-link:not(.cut)[data-sem]").length).toBe(0);
    const cut = [...r.root.querySelectorAll(".chain-link.cut")];
    expect(cut.length, "exactly one cut: between observation and engine").toBe(1);
    expect(cut[0]!.getAttribute("data-sem")).toBe("SEM-019");
    expect(cut[0]!.nextElementSibling?.getAttribute("data-field")).toBe("F05");
    expect(cut[0]!.previousElementSibling?.getAttribute("data-field")).toBe("F04");
  });
});

describe("[TX19][AK-GUI-04] openness signs pairwise distinct, never violation colour", () => {
  it("[TX19] SEM-006/007/008/009/012/031 differ in glyph or pattern and never use eval.violation", async () => {
    const reg = await import("../../src/semiontics/generated/sem");
    const open = ["SEM-006", "SEM-007", "SEM-008", "SEM-009", "SEM-012", "SEM-031"] as const;
    const sig = open.map((s) => `${reg.SEM[s].glyph ?? ""}|${(reg.SEM[s] as J).pattern ?? ""}|${(reg.SEM[s] as J).shape ?? ""}`);
    expect(new Set(sig).size).toBe(open.length);
    for (const s of open) expect((reg.SEM[s] as J).colour ?? (reg.SEM[s] as J).color).not.toBe("eval.violation");
  });
});

describe("[TX19][AK-GUI-06] metrics view", () => {
  it("[TX19] every evaluated metric shows n/d and the server decimal; undefined shows its reason; no overall score", async () => {
    for (const e of [EXP.baseline, EXP.sparse]) {
      const r = await renderAt(url(e, "STRUCTURAL_METRICS", "tick=5"));
      const m = snapshot<J>(`/experiments/${e}/metrics?aggregation=POOLED`);
      const cards = [...r.root.querySelectorAll("[data-metric]")];
      expect(cards.length).toBe(m.report.results.length);
      // bands regroup by relation; within one (metric, relation) the server order is kept
      const seen = new Map<string, number>();
      m.report.results.forEach((res: J) => {
        const k = `${res.metric_id}|${res.relation}`;
        const n = seen.get(k) ?? 0;
        seen.set(k, n + 1);
        const c = cards.filter((x) => x.getAttribute("data-metric") === res.metric_id && x.getAttribute("data-relation") === res.relation)[n]!;
        expect(c, k).toBeDefined();
        if (res.status === "EVALUATED") {
          expect(c.querySelector('[data-sem="SEM-021"] .fraction')).not.toBeNull();
          expect(c.querySelector('[data-sem="SEM-021"] .decimal')!.textContent).toContain(res.value.toFixed(3));
        } else {
          const u = c.querySelector('[data-sem="SEM-022"]');
          expect(u).not.toBeNull();
          expect(u!.getAttribute("data-term")).toBe(res.undefined_reason === "ZERO_DENOMINATOR" ? "msg.undefined.zero" : "msg.undefined.missing");
        }
      });
      expect(r.root.querySelector('[data-term="msg.no_composite"]')).not.toBeNull();
      const formulas = [...r.root.querySelectorAll('.metric-card [data-datum="formula"]')].map((x) => x.textContent);
      for (const d of m.definitions) if (m.report.results.some((x: J) => x.metric_id === d.metric_id)) expect(formulas).toContain(d.formula);
    }
  });
  it("[TX19] M07 is shown for ALL and OBSERVABLE_CASES", async () => {
    const r = await renderAt(url(EXP.baseline, "STRUCTURAL_METRICS", "tick=5"));
    const m07 = [...r.root.querySelectorAll('[data-metric="M07"]')];
    expect(m07.length).toBe(2);
    expect(m07.map((x) => x.textContent).join(" ")).toMatch(/All cases[\s\S]*Observable cases only|Observable cases only[\s\S]*All cases/);
  });
  it("[TX19] the sparse schedule leaves M03 Ω_R undefined (input missing) and says so", async () => {
    const r = await renderAt(url(EXP.sparse, "STRUCTURAL_METRICS", "tick=5"));
    const c = r.root.querySelector('[data-metric="M03"][data-relation="R"]');
    expect(c?.querySelector('[data-sem="SEM-022"]')?.getAttribute("data-term")).toBe("msg.undefined.missing");
  });
});

describe("[TX19][AK-GUI-07] engine data unaltered", () => {
  it("[TX19] Σ ids and operator symbols reach the DOM with their exact code points, labels missing → DEP-08 note", async () => {
    const r = await renderAt(url(EXP.baseline, "FORWARD_SWEEP_INSPECTOR", "tick=3"));
    const tr = snapshot<J>(`/experiments/${EXP.baseline}/results/sweep:fwd:t3:a0/trace`);
    const tokens = [...r.root.querySelectorAll('[data-sem="SEM-027"] [data-datum="engine"]')].map((x) => x.textContent);
    const expected: string[] = [];
    for (const s of tr.trace.content.steps) {
      if (s.sigma_ref) expected.push(s.sigma_ref.sigma_id);
      if (s.operator_ref) expected.push(s.operator_ref.symbol ?? s.operator_ref.code);
    }
    expect(tokens).toEqual(expected);
    for (const [a, b] of tokens.map((x, i) => [x, expected[i]])) expect([...a!].map((c) => c.codePointAt(0))).toEqual([...b!].map((c) => c.codePointAt(0)));
    const labels = new Map<string, string>(tr.registry_labels);
    if ([...labels.values()].every((v) => v === "LABEL_UNAVAILABLE")) {
      expect(r.root.querySelectorAll('[data-sem="SEM-027"] .engine-note').length).toBeGreaterThanOrEqual(tokens.length);
    }
  });
});

describe("[TX19][REQ-054] required blocks per view (counts from snapshots)", () => {
  const b = () => EXP.baseline;
  it("[TX19] 02 topology: one node per topology node, one path per relation", async () => {
    const r = await renderAt(url(b(), "TOPOLOGY_GRAPH", "tick=3"));
    const tp = snapshot<J>(`/experiments/${b()}/topology`).topology;
    expect(r.root.querySelectorAll("svg [data-node]").length).toBe(tp.nodes.length);
    expect(r.root.querySelectorAll("svg [data-relation]").length).toBe(tp.relations.length);
  });
  it("[TX19] 04 observation: every context observation and every source", async () => {
    const r = await renderAt(url(b(), "OBSERVATION_INSPECTOR", "tick=3"));
    const c = snapshot<J>(`/experiments/${b()}/observations?tick=3`).observation.content;
    expect(r.root.querySelectorAll("[data-observation]").length).toBe(c.context.observations.length);
    expect(r.root.querySelectorAll("[data-source]").length).toBe(c.source_register.entries.length);
  });
  it("[TX19] 05/06 runs: all trace steps, termination seal, target assessment", async () => {
    const f = await renderAt(url(b(), "FORWARD_SWEEP_INSPECTOR", "tick=3"));
    expect(f.root.querySelectorAll("[data-step]").length).toBe(snapshot<J>(`/experiments/${b()}/results/sweep:fwd:t3:a0/trace`).trace.content.steps.length);
    expect(f.root.querySelector('[data-sem="SEM-029"]')).not.toBeNull();
    const i = await renderAt(url(b(), "INVERSE_SWEEP_INSPECTOR", "tick=3"));
    const inv = snapshot<J>(`/experiments/${b()}/results?tick=3&attempt=0&direction=inverse`).inverse.content;
    expect(i.root.querySelectorAll("[data-goal]").length).toBe(inv.target_assessment.length);
  });
  it("[TX19] 07 gaps: one group per class key; subset toggle hides non-observable cases", async () => {
    const m = snapshot<J>(`/experiments/${b()}/metrics?aggregation=POOLED`).report;
    const keys = new Set(m.gap_matches.map((g: J) => g.class_key.join(" · ")));
    const all = await renderAt(url(b(), "STRUCTURAL_GAP_INSPECTOR", "tick=3"));
    expect(all.root.querySelectorAll("[data-class]").length).toBe(keys.size);
    const rowsAll = all.root.querySelectorAll("[data-class] tr").length;
    expect(rowsAll).toBe(m.gap_matches.length);
    const obs = await renderAt(url(b(), "STRUCTURAL_GAP_INSPECTOR", "tick=3&filter=observable"));
    const rowsObs = obs.root.querySelectorAll("[data-class] tr").length;
    expect(rowsAll - rowsObs).toBe(m.gap_matches.filter((g: J) => g.observable === false).length);
  });
  it("[TX19] 08 closure: four quadrants, one row per Ω_R rule evaluation", async () => {
    const r = await renderAt(url(b(), "ARCHITECTURAL_CLOSURE_INSPECTOR", "tick=3"));
    expect(r.root.querySelectorAll("[data-quadrant]").length).toBe(4);
    expect(r.root.querySelectorAll("[data-rule]").length).toBe(snapshot<J>(`/experiments/${b()}/governance?tick=3&space=R`).evaluations.content.evaluations.length);
  });
  it("[TX19] 10 comparison: four buckets with the server's members", async () => {
    const r = await renderAt(url(b(), "SCENARIO_COMPARISON", `tick=3&comparisonId=${encodeURIComponent(CMP)}`));
    const c = snapshot<J>(`/comparisons/${CMP}`).comparison;
    const buckets = [...r.root.querySelectorAll("[data-bucket]")];
    expect(buckets.map((x) => x.querySelectorAll("li").length)).toEqual([c.resolved.length, c.persisting.length, c.new.length, c.unevaluable_in_recovery.length]);
  });
  it("[TX19] 11 timeline: two separate tracks with all events and stage events", async () => {
    const r = await renderAt(url(b(), "EVENT_TIMELINE", "tick=3"));
    const e = snapshot<J>(`/experiments/${b()}/events`);
    expect(r.root.querySelectorAll('[data-track="scenario"] tr').length).toBe(e.events.length);
    expect(r.root.querySelectorAll('[data-track="pipeline"] tr').length).toBe(e.stage_events.length);
  });
});
