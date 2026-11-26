"""FX-BUNDLE-TX14 — contract walkthrough over all 27 artifact types (Kap. 15.3 step 1, K-36, K-54).

Every artifact below is written by hand (explicit values, no pipeline). The store and the bundle exporter
only assign IDs, revisions and the hash. The file is TEST DATA: data_origin FIXTURE / SYNTHETIC, no engine
result is contained. `make sync` regenerates it; TX14 checks it.
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.contracts.common import ArtifactRef, FieldId, StageEvent  # noqa: E402
from app.contracts.registry import ARTIFACT_TYPES, BundleDefinitions  # noqa: E402
from app.experiments.bundle import build_bundle  # noqa: E402
from app.store import ArtifactStore, FieldWriter  # noqa: E402
from app.topology import seal  # noqa: E402

OUT = ROOT / "synthetic_fixtures" / "bundles" / "fx_bundle_tx14.json"
EXP = "exp:fx_tx14_replay"


def M(t: str, data: dict[str, Any]) -> Any:
    return ARTIFACT_TYPES[t].model_validate_json(json.dumps(data, ensure_ascii=False))


def sref(n: str, v: int = 1) -> dict[str, Any]:
    return {"point": n, "variant": {"merge.policy": "engine_first", "metrics.hypothesis_policy": "include",
                                    "metrics.coverage_weighting": "weighted",
                                    "metrics.service_function_spaces": "a_only",
                                    "metrics.closure_basis": "state_rules_a_final_tick",
                                    "metrics.stability_source": "resweep_same_bundle",
                                    "metrics.gap_matcher": "subjects_tickwindow_1to1",
                                    "observation.budget_unit": "items_bytes"}[n], "version": v}


def build(out: Path = OUT) -> dict[str, Any]:
    with tempfile.TemporaryDirectory() as tmp:
        store = ArtifactStore(Path(tmp))
        W = {f: FieldWriter(store, FieldId(f), EXP, f"fx.tx14.{f.lower()}") for f in
             ("F01", "F02", "F03", "F04", "F05", "F06")}
        refs: dict[str, ArtifactRef] = {}

        def put(field: str, t: str, key: str, tick: int | None, data: dict[str, Any], name: str,
                src: tuple[str, ...] = (), origin: str = "SYNTHETIC") -> dict[str, Any]:
            env = W[field].put(t, M(t, data), key, tick, tuple(refs[s] for s in src), origin)
            refs[name] = ArtifactRef(artifact_id=env.artifact_id, artifact_type=t, content_hash=env.content_hash)
            return refs[name].model_dump(mode="json")

        stage = 0

        def ev(st: str, status: str, tick: int | None = None, error: dict[str, Any] | None = None) -> None:
            nonlocal stage
            store.stage(EXP, StageEvent.model_validate_json(json.dumps({"seq": stage, "stage": st, "status": status, "tick": tick,
                                                         "error": error})))
            stage += 1

        ev("DEFINITIONS", "RUNNING")
        # ---- F01 ------------------------------------------------------------------------------------
        topo = json.loads((ROOT / "synthetic_fixtures/f01_topology/fx_04_11.json").read_text(encoding="utf-8"))
        topo_ref = put("F01", "topology_definition", "topo:fx_04_11@1.0.0", None, topo, "topo")
        sealed = seal(M("topology_definition", topo)).model_dump(mode="json")
        put("F01", "immutable_topology", "topo:fx_04_11@1.0.0", None, sealed, "itopo", ("topo",))
        # ---- F02 ------------------------------------------------------------------------------------
        approval = {"approval_id": "appr:a1", "role_ref": "role:operator", "rule_ref": "rule:gate_needs_auth",
                    "subject_refs": ["node:n05"], "decision": "APPROVED", "tick": 1, "rationale": "fixture"}
        gov = {"governance_id": "gov:fx_tx14", "version": "1.0.0", "topology_ref": topo_ref,
               "roles": [{"role_id": "role:operator", "label": "Operator"}],
               "rules": [
                   {"rule_id": "rule:health_ok", "version": "1.0.0", "kind": "STATE", "scope": ["node:n01"],
                    "applies_to": ["node:n01"], "expression": {"op": "in", "attr": "attr:n01/state",
                                                               "values": ["NOMINAL", "DEGRADED"]},
                    "description": "n01 is not faulty"},
                   {"rule_id": "rule:gate_needs_auth", "version": "1.0.0", "kind": "STATE",
                    "applies_to": ["node:n05", "node:n09"], "requires": ["rule:health_ok"], "permits": ["role:operator"],
                    "valid_from_tick": 0, "valid_until_tick": 2,
                    "expression": {"op": "implies", "if": {"op": "eq", "attr": "attr:n05/state", "value": "OPEN"},
                                   "then": {"op": "eq", "attr": "attr:n09/state", "value": "AUTHORIZED"}}},
                   {"rule_id": "rule:mode_steps", "version": "1.0.0", "kind": "TRANSITION", "applies_to": ["node:n04"],
                    "expression": {"op": "and", "args": [
                        {"op": "transition_in", "attr": "attr:n04/state",
                         "allowed": [{"from": "ACTIVE", "to": "ACTIVE"}, {"from": "ACTIVE", "to": "STANDBY"},
                                     {"from": "STANDBY", "to": "ACTIVE"}]},
                        {"op": "not", "arg": {"op": "eq", "attr": "attr:n03/state", "value": "CRITICAL", "at": "NEXT"}},
                        {"op": "in", "attr": "attr:n04/state", "values": ["ACTIVE", "STANDBY"], "at": "CURRENT"}]}},
                   {"rule_id": "rule:svc_supply", "version": "1.0.0", "kind": "FUNCTION", "applies_to": ["node:n02"],
                    "expression": {"op": "or", "args": [{"op": "eq", "attr": "attr:n02/state", "value": "NOMINAL"},
                                                        {"op": "eq", "attr": "attr:n02/state", "value": "DEGRADED"}]}}]}
        gov_ref = put("F02", "governance_definition", "gov:fx_tx14@1.0.0", None, gov, "gov", ("topo",))
        # ---- F03 scenario + annotations ------------------------------------------------------------
        init = [{"attribute_ref": f"attr:n{i:02d}/state", "applicability": "APPLICABLE",
                 "value": v} for i, v in enumerate(["NOMINAL", "NOMINAL", "DEGRADED", "ACTIVE", "CLOSED", "NOMINAL",
                                                    "STANDBY", "NOMINAL", "AUTHORIZED", "CRITICAL"], start=1)]
        inputs = [{"event_id": "evt:e1", "tick": 1, "seq": 0, "kind": "SET_ATTRIBUTE", "attribute_ref": "attr:n05/state",
                   "value": "OPEN"},
                  {"event_id": "evt:e2", "tick": 1, "seq": 1, "kind": "APPLY_APPROVAL", "attribute_ref": "attr:n09/state",
                   "approval": approval}]
        base = {"scenario_id": "scn:fx_base", "version": "1.0.0", "variant_kind": "BASELINE",
                "fixture_lineage_id": "lin:fx_04_11", "topology_ref": topo_ref, "governance_ref": gov_ref,
                "initial_state": init, "inputs": inputs, "tick_count": 3, "service_function_refs": ["rule:svc_supply"],
                "is_fixture": True, "label": "Baseline (fixture)"}
        scn_ref = put("F03", "scenario_definition", "scn:fx_base@1.0.0", None, base, "scn", ("topo", "gov"))
        ann = {"scenario_ref": scn_ref, "cases": [
            {"case_id": "case:c1", "kind": "gate_without_authorization", "subject_refs": ["attr:n05/state", "rule:gate_needs_auth"],
             "rule_ref": "rule:gate_needs_auth", "tick_from": 1, "tick_to": 2},
            {"case_id": "case:c2", "kind": "hidden_critical", "subject_refs": ["node:n10"], "tick_from": 0}]}
        ann_ref = put("F03", "consistency_annotation_set", "scn:fx_base@1.0.0", None, ann, "ann", ("scn",))
        # ---- F04 config + target --------------------------------------------------------------------
        cfg = {"config_id": "ocfg:fx_partial", "version": "1.0.0",
               "sources": [{"source_id": "src:s01", "label": "Quelle 01",
                            "observes": [f"attr:n{i:02d}/state" for i in range(1, 7)],
                            "active": [{"from_tick": 0, "to_tick": None}], "lag_ticks": 0},
                           {"source_id": "src:s02", "label": "Quelle 02", "observes": ["attr:n07/state"],
                            "active": [{"from_tick": 0, "to_tick": 0}, {"from_tick": 2}], "lag_ticks": 1}],
               "visible_nodes": [f"node:n{i:02d}" for i in range(1, 8)],
               "visible_relations": ["rel:depends_on:n02:n01", "rel:depends_on:n03:n02"],
               "visible_rules": ["rule:health_ok", "rule:mode_steps"],
               "bundle_budget": {"max_observations": 200, "max_bytes": 200000},
               "serialization_profiles": ["full", "compact"]}
        cfg_ref = put("F04", "observation_config", "ocfg:fx_partial@1.0.0", None, cfg, "cfg", ("topo", "gov"))
        tgt = {"target_id": "tgt:fx_target", "version": "1.0.0", "authored_by": "fixture author", "goals": [
            {"goal_id": "goal:g1", "subject_ref": "node:n01", "property": "RULE_SATISFIED", "rule_ref": "rule:health_ok"},
            {"goal_id": "goal:g2", "subject_ref": "attr:n04/state", "property": "ATTRIBUTE_EQUALS", "value": "ACTIVE"}]}
        tgt_ref = put("F04", "target_definition", "tgt:fx_target@1.0.0", None, tgt, "tgt", ("cfg",))
        ws = {"weight_set_id": "ws:fx_default", "version": "1.0.0", "default_weight": {"n": 1, "d": 1},
              "weights": [{"attribute_ref": "attr:n08/state", "weight": {"n": 2, "d": 1}}]}
        ws_ref = put("F06", "weight_set", "ws:fx_default@1.0.0", None, ws, "ws")
        reg = {"registry_id": "oreg:fx_placeholder", "version": "0.0.1",
               "source": "fixture placeholder — not the SYNTX registry (DEP-08)",
               "operators": [{"ref": {"namespace": "CANONICAL_V181", "symbol": "∆", "registry_version": "v1.8.1"},
                              "label_from_source": "LABEL_UNAVAILABLE", "description_from_source": "fixture"},
                             {"ref": {"namespace": "R", "code": "R01", "registry_version": "fx"},
                              "label_from_source": "LABEL_UNAVAILABLE"},
                             {"ref": {"namespace": "I", "code": "I01", "registry_version": "fx"},
                              "label_from_source": "LABEL_UNAVAILABLE"},
                             {"ref": {"namespace": "EXTERNAL", "code": "ext.op", "registry_version": "fx"},
                              "label_from_source": "LABEL_UNAVAILABLE"}],
               "sigma_fields": [{"ref": {"sigma_id": "Σ01", "registry_version": "v1.8.1"}},
                                {"ref": {"sigma_id": "Σ02", "registry_version": "v1.8.1"},
                                 "label_from_source": "LABEL_UNAVAILABLE"}],
               "sigma_couplings": [{"source": {"sigma_id": "Σ01", "registry_version": "v1.8.1"},
                                    "target": {"sigma_id": "Σ02", "registry_version": "v1.8.1"},
                                    "operator": {"namespace": "CANONICAL_V181", "symbol": "∆",
                                                 "registry_version": "v1.8.1"},
                                    "relation_label_from_source": "LABEL_UNAVAILABLE"}]}
        reg_ref = put("F05", "operator_registry", "oreg:fx_placeholder@0.0.1", None, reg, "reg", (), "FIXTURE")
        strat = {p.split(".")[1]: sref(p) for p in ("metrics.hypothesis_policy", "metrics.coverage_weighting",
                                      "metrics.service_function_spaces", "metrics.closure_basis",
                                      "metrics.stability_source", "metrics.gap_matcher")}
        edef = {"definition_version": "1.0.2", "scenario_ref": scn_ref, "observation_config_ref": cfg_ref,
                "target_definition_ref": tgt_ref,
                "adapter": {"kind": "FIXTURE", "config_ref": "adcfg:fx_04_11", "merge_policy": sref("merge.policy")},
                "sweep_schedule": {"mode": "EXPLICIT", "ticks": [1, 2]}, "stability": {"enabled": True, "tick": 2},
                "metric_config": {"weight_set_ref": "ws:fx_default", "comparison_tick": 2, **strat},
                "observation_strategy": {"budget_unit": sref("observation.budget_unit")},
                "replay_of": "exp:fx_tx14_origin", "replay_mode": "SYNTHETIC", "label": "TX14 walkthrough (replay)"}
        edef_ref = put("F03", "experiment_definition", "definition", None, edef, "edef", ("scn", "cfg", "tgt"))
        ev("DEFINITIONS", "COMPLETED")
        # ---- F03 emulation --------------------------------------------------------------------------
        ev("EMULATION", "RUNNING")
        states = []
        vals = {a["attribute_ref"]: a["value"] for a in init}
        for t in range(3):
            if t == 1:
                vals["attr:n05/state"] = "OPEN"
            if t == 2:
                vals["attr:n04/state"] = "STANDBY"
            st = {"scenario_ref": scn_ref, "tick": t, "last_seq": 1 if t >= 1 else None,
                  "values": [{"attribute_ref": k, "applicability": "APPLICABLE", "value": v} for k, v in sorted(vals.items())]}
            states.append(put("F03", "actual_state", f"t{t}", t, st, f"as{t}", ("scn",)))
        put("F03", "event_record", "s0", 1, {"seq": 0, "tick": 1, "event_ref": "evt:e1", "kind": "SET_ATTRIBUTE",
                                             "status": "APPLIED", "effects": [{"attribute_ref": "attr:n05/state",
                                                                               "before": "CLOSED", "after": "OPEN"}]},
            "er0", ("scn",))
        put("F03", "event_record", "s1", 1, {"seq": 1, "tick": 1, "event_ref": "evt:e2", "kind": "APPLY_APPROVAL",
                                             "status": "REJECTED", "error": {
                                                 "code": "INVALID_TRANSITION", "field": "F03",
                                                 "message": "role lacks permit (K-66)", "subject_refs": ["attr:n09/state"],
                                                 "tick": 1, "recovery": "REPLAY_FROM_INITIAL"}}, "er1", ("scn",))
        ev("EMULATION", "COMPLETED")
        # ---- F04 observation ------------------------------------------------------------------------
        ev("OBSERVATION", "RUNNING")
        doms = {d["domain_id"]: d for d in topo["value_domains"]}
        vis_nodes = [n for n in topo["nodes"] if n["node_id"] in cfg["visible_nodes"]]
        otopo = {"nodes": vis_nodes, "relations": [r for r in topo["relations"] if r["relation_id"] in cfg["visible_relations"]],
                 "value_domains": [doms[d] for d in sorted({a["domain_ref"] for n in vis_nodes for a in n["attributes"]})]}
        put("F04", "observable_topology", "ocfg:fx_partial@1.0.0", None, otopo, "otopo", ("cfg",))
        orules = {"rules": [r for r in gov["rules"] if r["rule_id"] in cfg["visible_rules"]]}
        put("F04", "observable_rules", "ocfg:fx_partial@1.0.0", None, orules, "orules", ("cfg",))
        contexts = []
        for t in range(3):
            obs = []
            cur = {v["attribute_ref"]: v["value"] for v in M("actual_state", {"scenario_ref": scn_ref, "tick": t,
                   "values": [{"attribute_ref": k, "applicability": "APPLICABLE", "value": v} for k, v in
                              sorted({**{a["attribute_ref"]: a["value"] for a in init},
                                      **({"attr:n05/state": "OPEN"} if t >= 1 else {}),
                                      **({"attr:n04/state": "STANDBY"} if t >= 2 else {})}.items())]}).model_dump()["values"]}
            for i in range(1, 7):
                a = f"attr:n{i:02d}/state"
                obs.append({"observation_id": f"obs:s01:n{i:02d}/state:t{t}", "source_id": "src:s01", "tick": t,
                            "observed_at_tick": t, "attribute_ref": a, "status": "KNOWN", "value": cur[a],
                            "references": ["rel:depends_on:n02:n01"] if i == 2 else []})
            if t == 0:
                obs.append({"observation_id": "obs:s02:n07/state:t0", "source_id": "src:s02", "tick": 0,
                            "observed_at_tick": 0, "attribute_ref": "attr:n07/state", "status": "KNOWN", "value": "STANDBY"})
            else:
                obs.append({"observation_id": f"obs:none:n07/state:t{t}", "source_id": None, "tick": t,
                            "observed_at_tick": t, "attribute_ref": "attr:n07/state", "status": "UNKNOWN"})
            contexts.append({"context_version": f"ctx:{t}", "sequence": t, "tick": t,
                             "previous_context_ref": f"ctx:{t - 1}" if t else None, "observations": obs})
        register = {"entries": [{"source_id": "src:s01", "first_tick": 0, "last_tick": 2, "continuity": "CONTINUOUS"},
                                {"source_id": "src:s02", "first_tick": 0, "last_tick": 0, "continuity": "INTERRUPTED",
                                 "gaps": [{"from_tick": 1, "to_tick": 2}]}]}
        put("F04", "source_register", "t2", 2, register, "sreg", ("cfg",))
        bundles = {}
        for t in (1, 2):
            b = {"bundle_key": f"bundle:t{t}", "up_to_tick": t, "contexts": contexts[: t + 1],
                 "observable_topology": otopo, "observable_rules": orules, "source_register": register,
                 "serialization_profile": "full", "budget_usage": {"observations": 7 * (t + 1), "bytes": 1800 * (t + 1)}}
            bundles[t] = put("F04", "observation_bundle", f"t{t}", t, b, f"ob{t}", ("cfg",))
        for t in (1, 2):
            put("F04", "observation_record", f"t{t}", t, {"bundle_ref": bundles[t], "tick": t,
                                                          "actual_state_refs": states[: t + 1],
                                                          "observation_config_ref": cfg_ref},
                f"orec{t}", (f"ob{t}", "cfg") + tuple(f"as{i}" for i in range(t + 1)))
        ev("OBSERVATION", "COMPLETED")
        # ---- F05 sweeps (FIXTURE, not engine output) -------------------------------------------------
        adapter = {"adapter_id": "adapter.fixture", "kind": "FIXTURE", "adapter_version": "1.0.2",
                   "engine_version": "none (fixture)", "is_fixture": True,
                   "capabilities": {"forward": True, "inverse": True, "merge": False, "trace": True},
                   "operator_registry_ref": reg_ref}

        def term(reason: str = "CONVERGED") -> dict[str, Any]:
            return {"reason": reason, "steps_executed": 2, "budget": 10, "last_step_seq": 1,
                    "engine_message": "fixture adapter: no engine executed"}

        def vals_r(t: int) -> list[dict[str, Any]]:
            out = []
            for i in range(1, 11):
                a = f"attr:n{i:02d}/state"
                if i <= 6:
                    out.append({"attribute_ref": a, "status": "DETERMINED", "value": None, "epistemic_class": "SOURCE_OBSERVATION",
                                "derived_from": [f"obs:s01:n{i:02d}/state:t{t}"]})
                elif i == 7:
                    out.append({"attribute_ref": a, "status": "DETERMINED", "value": "STANDBY",
                                "epistemic_class": "HYPOTHESIS", "derived_from": ["obs:s02:n07/state:t0"],
                                "reference_status": "RESOLVED"})
                elif i == 8:
                    out.append({"attribute_ref": a, "status": "DETERMINED", "value": "DEGRADED",
                                "epistemic_class": "STRUCTURAL_DERIVATION", "derived_from": ["rel:depends_on:n08:n06"]})
                else:
                    out.append({"attribute_ref": a, "status": "UNDETERMINED", "epistemic_class": "OPEN_REFERENCE",
                                "reference_status": "UNRESOLVED" if i == 9 else "TRUNCATED"})
            cur = {c["attribute_ref"]: c["value"] for c in contexts[t]["observations"] if c["status"] == "KNOWN"}
            for o in out[:6]:
                o["value"] = cur[o["attribute_ref"]]
            return out

        def output(t: int) -> dict[str, Any]:
            return {"values": vals_r(t),
                    "relations": [{"relation_key": "rel:depends_on:n08:n06", "relation_type": "depends_on",
                                   "source": "node:n08", "target": "node:n06", "coupling_status": "POSSIBLE",
                                   "epistemic_class": "STRUCTURAL_DERIVATION", "derived_from": ["obs:s01:n06/state:t0"]},
                                  {"relation_key": "rel:unknown:n10:n08", "source": "node:n10", "target": "node:n08",
                                   "coupling_status": "UNKNOWN_OPEN", "epistemic_class": "OPEN_REFERENCE"}],
                    "gaps": [{"gap_id": f"gap:t{t}:1", "kind": "unobserved_dependency", "subject_refs": ["node:n10"],
                              "source_refs": ["rel:depends_on:n10:n08"], "epistemic_class": "OPEN_REFERENCE",
                              "status": "OPEN"}],
                    "open_relations": [{"relation_key": "rel:unknown:n10:n08", "subject_refs": ["node:n10", "node:n08"],
                                        "reason": "no observation reaches n10", "reference_status": "UNRESOLVED"}]}

        def trace(sid: str) -> dict[str, Any]:
            return {"sweep_id": sid, "reference_status": "RESOLVED", "steps": [
                {"step_id": f"step:{sid.split(':', 1)[1]}:0", "step_seq": 0,
                 "operator_ref": {"namespace": "CANONICAL_V181", "symbol": "∆", "registry_version": "v1.8.1"},
                 "sigma_ref": {"sigma_id": "Σ01", "registry_version": "v1.8.1"},
                 "input_refs": ["ctx:0"], "output_refs": ["attr:n08/state"], "epistemic_class": "STRUCTURAL_DERIVATION",
                 "engine_note": "fixture step"},
                {"step_id": f"step:{sid.split(':', 1)[1]}:1", "step_seq": 1, "epistemic_class": "SOURCE_OBSERVATION"}]}

        ev("FORWARD", "RUNNING", 1)
        recs: dict[int, dict[str, Any]] = {}
        for t in (1, 2):
            fsid, isid = f"sweep:fwd:t{t}:a0", f"sweep:inv:t{t}:a0"
            fwd = {"sweep_id": fsid, "direction": "FORWARD", "attempt": 0, "adapter": adapter,
                   "input_bundle_ref": bundles[t], "up_to_tick": t, "context_version": f"ctx:{t}",
                   "execution_status": "COMPLETED", "termination": term()}
            inv = {**fwd, "sweep_id": isid, "direction": "INVERSE", "target_ref": tgt_ref,
                   "termination": term("ENGINE_REPORTED_STOP")}
            put("F05", "sweep_run", f"fwd:t{t}:a0", t, fwd, f"swf{t}", (f"ob{t}",), "FIXTURE")
            put("F05", "sweep_run", f"inv:t{t}:a0", t, inv, f"swi{t}", (f"ob{t}", "tgt"), "FIXTURE")
            fr = put("F05", "forward_result", f"fwd:t{t}:a0", t, {"sweep": fwd, "output": output(t), "trace": trace(fsid)},
                     f"fr{t}", (f"swf{t}",), "FIXTURE")
            ir = put("F05", "inverse_result", f"inv:t{t}:a0", t,
                     {"sweep": inv, "output": output(t), "trace": trace(isid),
                      "target_assessment": [{"goal_id": "goal:g1", "status": "MET", "derived_from": ["attr:n01/state"]},
                                            {"goal_id": "goal:g2", "status": "UNDETERMINED"}]},
                     f"ir{t}", (f"swi{t}",), "FIXTURE")
            rec = {"reconstruction_id": f"recon:t{t}:a0", "attempt": 0, "up_to_tick": t, "context_version": f"ctx:{t}",
                   "merge": {"policy": sref("merge.policy"), "engine_merged": False, "forward_ref": fr, "inverse_ref": ir,
                             "conflicts": [{"attribute_ref": "attr:n07/state", "forward": "STANDBY", "inverse": "ACTIVE",
                                            "resolution": "UNDETERMINED"}]},
                   "output": output(t),
                   "openness": {"undetermined": 2, "unknown_observations": 3, "open_references": 2, "open_relations": 1,
                                "structural_gaps_open": 1, "unevaluable_rules": 1}}
            if t == 2:
                rec["previous_reconstruction_ref"] = recs[1]
                rec["delta_state"] = {"space": "R", "from_tick": 1, "to_tick": 2, "changes": [
                    {"attribute_ref": "attr:n04/state", "before": {"status": "DETERMINED", "value": "ACTIVE"},
                     "after": {"status": "DETERMINED", "value": "STANDBY"}}]}
                rec["delta_coupling"] = {"from_tick": 1, "to_tick": 2, "changes": [
                    {"relation_key": "rel:depends_on:n08:n06", "before": "ABSENT", "after": "POSSIBLE"}]}
            recs[t] = put("F05", "reconstruction_result", f"t{t}:a0", t, rec, f"rr{t}", (f"fr{t}", f"ir{t}"), "FIXTURE")
        ev("FORWARD", "COMPLETED", 2)
        ev("INVERSE", "COMPLETED", 2)
        ev("MERGE", "COMPLETED", 2)
        ev("STABILITY", "RUNNING", 2)
        blocked = {"sweep_id": "sweep:fwd:t2:a1", "direction": "FORWARD", "attempt": 1,
                   "adapter": {**adapter, "adapter_id": "adapter.local", "kind": "LOCAL", "is_fixture": False,
                               "engine_version": None, "operator_registry_ref": None,
                               "capabilities": {"forward": True, "inverse": True, "merge": True, "trace": True}},
                   "input_bundle_ref": bundles[2], "up_to_tick": 2, "context_version": "ctx:2",
                   "execution_status": "BLOCKED",
                   "error": {"code": "ENGINE_UNAVAILABLE", "field": "F05", "message": "no local engine (DEP-02)",
                             "tick": 2, "recovery": "RESWEEP"}}
        put("F05", "sweep_run", "fwd:t2:a1", 2, blocked, "swb", ("ob2",), "SYNTHETIC")
        ev("STABILITY", "BLOCKED", 2, blocked["error"])
        prop = {"proposal_id": "prop:p1", "reconstruction_ref": recs[2], "subject_refs": ["node:n05", "node:n09"],
                "description_from_engine": "fixture: close gate until authorization", "status": "PROPOSED"}
        prop_ref = put("F05", "recovery_proposal", "prop:p1", 2, prop, "prop", ("rr2",), "FIXTURE")
        # ---- F02 authority + derived recovery scenario (K-08, endpoint #21 shape) -------------------
        auth0 = {"decision_id": "auth:d1", "role_ref": "role:operator", "proposal_ref": prop_ref, "decision": "APPROVED",
                 "rationale": "fixture decision"}
        auth0_ref = put("F02", "authority_record", "auth:d1", None, auth0, "auth0", ("prop",))
        rec_scn = {**base, "scenario_id": "scn:fx_rec", "variant_kind": "RECOVERY", "variant_of": scn_ref,
                   "derived_from_proposal": prop_ref, "authority_ref": auth0_ref, "label": "Recovery (fixture)",
                   "inputs": [inputs[0], {**inputs[0], "event_id": "evt:e3", "seq": 1, "value": "CLOSED", "tick": 2}]}
        rscn_ref = put("F03", "scenario_definition", "scn:fx_rec@1.0.0", None, rec_scn, "rscn", ("scn", "auth0", "prop"))
        put("F02", "authority_record", "auth:d1", None, {**auth0, "created_scenario_ref": rscn_ref}, "auth1",
            ("prop", "rscn"))
        # ---- F06 evaluation -------------------------------------------------------------------------
        ev("EVALUATION", "RUNNING")
        evals = [{"rule_ref": "rule:gate_needs_auth", "rule_version": "1.0.0", "space": "A", "tick": 1,
                  "result": "TRUE", "reason": "OK", "input_attribute_refs": ["attr:n05/state", "attr:n09/state"]},
                 {"rule_ref": "rule:health_ok", "rule_version": "1.0.0", "space": "A", "tick": 1, "result": "TRUE",
                  "reason": "OK", "input_attribute_refs": ["attr:n01/state"]},
                 {"rule_ref": "rule:mode_steps", "rule_version": "1.0.0", "space": "A", "tick": 1, "tick_to": 2,
                  "result": "TRUE", "reason": "OK", "input_attribute_refs": ["attr:n03/state", "attr:n04/state"]},
                 {"rule_ref": "rule:svc_supply", "rule_version": "1.0.0", "space": "A", "tick": 1, "result": "TRUE",
                  "reason": "OK", "input_attribute_refs": ["attr:n02/state"]}]
        put("F06", "rule_evaluation_set", "A:t1", 1, {"governance_ref": gov_ref, "space": "A", "tick": 1,
                                                       "evaluations": evals, "not_in_validity": 0,
                                                       "summary": {"true": 4, "false": 0, "unevaluable": 0,
                                                                   "not_in_validity": 0}}, "res", ("gov", "as1"))
        mr = {"metric_id": "M01", "value": 0.125, "status": "EVALUATED", "unit": "ratio", "version": "1.0.0",
              "reference_space": "space:attr:t2", "numerator": {"n": 1, "d": 1}, "denominator": {"n": 8, "d": 1},
              "tick": 2, "relation": "A_R", "case_subset": "ALL", "aggregation": "PER_TICK",
              "aux": {"undetermined_count": 2, "hypotheses_excluded": 0, "unevaluable_count": 0, "not_in_validity": 0,
                      "not_applicable_excluded": 0, "stale_known": 0, "tp": 1, "fp": 0, "fn": 1, "observable_cases": 1,
                      "shared_coverage": {"n": 3, "d": 5}, "shared_coverage_undefined": False, "persisting": 0,
                      "new_inconsistencies": 0, "unevaluable_in_recovery": 0, "function_ref": "rule:svc_supply",
                      "ticks_included": 1, "ticks_excluded": 0}}
        mu = {"metric_id": "M10", "value": None, "status": "UNDEFINED", "undefined_reason": "INPUT_MISSING",
              "version": "1.0.0", "reference_space": "space:attr:t2", "relation": "R1_R2", "aggregation": "PER_TICK"}
        report = {"report_key": "report:fx", "version": "1.0.2", "inputs": [recs[2], states[2]],
                  "reference_spaces": [{"reference_space_id": "space:attr:t2", "kind": "ATTRIBUTE", "tick": 2,
                                        "members": [f"attr:n{i:02d}/state" for i in range(1, 11)],
                                        "weight_set_ref": "ws:fx_default", "space_hash": recs[2]["content_hash"]}],
                  "results": [mr, mu], "rule_evaluations": [refs["res"].model_dump(mode="json")],
                  "gap_matches": [{"tick": 2, "case_id": "case:c2", "gap_id": "gap:t2:1", "verdict": "TP", "observable": False,
                                   "matcher": sref("metrics.gap_matcher"), "class_key": ["node:n10"]}],
                  "strategies": [sref("metrics.hypothesis_policy")],
                  "errors": [blocked["error"]], "execution_status": "PARTIAL", "data_origin": "FIXTURE",
                  "attribute_membership": [{"tick": 2, "attribute_ref": "attr:n08/state", "in_d_ref": True,
                                            "in_d_obs": False, "in_d_det": True, "delta": 1, "weight": {"n": 2, "d": 1}}]}
        put("F06", "evaluation_report", "report", None, report, "rep", ("rr2", "as2", "res", "ann", "ws"), "FIXTURE")
        comp = {"comparison_key": "cmp:fx_base:fx_rec:2", "baseline_experiment_id": "exp:fx_tx14_origin",
                "recovery_experiment_id": "exp:fx_tx14_recovery", "fixture_lineage_id": "lin:fx_04_11",
                "comparison_tick": 2, "compatible": True, "incompatibility": ["none"],
                "original": ["rule:gate_needs_auth|node:n05"], "resolved": ["rule:gate_needs_auth|node:n05"],
                "persisting": [], "unevaluable_in_recovery": [], "new": [],
                "results": [{**mr, "metric_id": "M09", "relation": "BASELINE_RECOVERY", "numerator": {"n": 1, "d": 1},
                             "denominator": {"n": 1, "d": 1}, "value": 1.0}],
                "basis": sref("metrics.closure_basis")}
        put("F06", "comparison_report", "exp:fx_tx14_origin:exp:fx_tx14_recovery:2", 2, comp, "cmp", ("scn", "rscn"))
        ev("EVALUATION", "PARTIAL")
        rr = {"original_experiment_id": "exp:fx_tx14_origin", "replay_experiment_id": EXP, "mode": "SYNTHETIC",
              "compared_types": ["actual_state", "observation_bundle"],
              "matches": [{"artifact_type": "actual_state", "logical_key": "t0", "original_id": states[0]["artifact_id"],
                           "replay_id": states[0]["artifact_id"], "equal": True},
                          {"artifact_type": "observation_bundle", "logical_key": "t9", "original_id": None,
                           "replay_id": None, "equal": True}],
              "verdict": "IDENTICAL"}
        put("F03", "replay_report", "exp:fx_tx14_origin:" + EXP, None, rr, "rrep", ("as0",))
        ev("EXPORT", "COMPLETED")
        defs = BundleDefinitions(topology=refs["topo"], governance=refs["gov"], scenario=refs["scn"],
                                 annotations=refs["ann"], observation_config=refs["cfg"], target=refs["tgt"],
                                 weight_set=refs["ws"], experiment_definition=refs["edef"],
                                 operator_registry=refs["reg"])
        bundle = build_bundle(store, EXP, defs)
        data: dict[str, Any] = bundle.model_dump(mode="json", by_alias=True)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
        return data


if __name__ == "__main__":
    d = build()
    print(f"wrote {OUT.relative_to(ROOT)}: {len(d['artifacts'])} envelopes, "
          f"{len({a['artifact_type'] for a in d['artifacts']})} types, hash {d['bundle_hash']}")
