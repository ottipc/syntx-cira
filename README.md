# CIRA — synthetic research demonstrator

CIRA lets an engine reconstruct the state of a **synthetic** service system **blind** (it never sees the reference
state), measures the result **exactly** (fraction by fraction, no overall score) and keeps every number
**traceable** (origin, test-fixture status, export with hash). Synthetic service lab — no real sites or infrastructure.

Architecture: frozen v1.0.2 — `docs/architecture/SYNTX_CIRA_Consolidated_Architecture_Package_v1.0.2.md` (SSOT).
Current state: `docs/STATUS.md` (computed), reports with hash: `docs/test-reports/phase-0N.json`.

> No engine is connected in this release (DEP-02). All reconstruction results are **test fixtures** and are marked
> TEST FIXTURE everywhere in the API and the workspace.

## Requirements
- Python ≥ 3.12 (tested with 3.13), Node.js ≥ 22, a Chrome/Chromium for the browser tests (`CIRA_CHROME`, default
  `/usr/bin/google-chrome`), optional Docker with Compose for the runtime chain.

## Quick start
```bash
# backend + dev tools
python3 -m pip install -e "backend[dev]"        # or install the versions pinned in backend/pyproject.toml
# frontend
(cd frontend && npm ci)

make run            # API on http://127.0.0.1:8000  (store in ./experiments)
make run-frontend   # workspace on http://127.0.0.1:4173 (second terminal)
```
Open http://127.0.0.1:4173, pick an experiment (or create one with “Control”), or start the demo:
`Demo → Resume demo`, then PageDown / PageUp. Languages: English (default) and German.

To create the demo data without the GUI:
```bash
curl -s -X POST localhost:8000/experiments -H 'Content-Type: application/json' \
  -d '{"scenario_id":"scn:fx_base","observation_config_id":"ocfg:fx_partial","target_definition_id":"tgt:fx","label":"Baseline"}'
curl -s -X POST localhost:8000/experiments -H 'Content-Type: application/json' \
  -d '{"scenario_id":"scn:fx_rec","observation_config_id":"ocfg:fx_partial","target_definition_id":"tgt:fx","label":"Recovery"}'
curl -s -X POST localhost:8000/comparisons -H 'Content-Type: application/json' \
  -d '{"baseline_experiment_id":"<baseline id>","recovery_experiment_id":"<recovery id>"}'
```

## Runtime chain (Docker)
```bash
make compose        # docker compose up --build --wait, then tools/smoke.sh against both containers
```
Backend on 127.0.0.1:8000 (health check), workspace on 127.0.0.1:4173. Without a Docker daemon the acceptance item
AK-10 is recorded as `DEP-07a / EXTERN_AUSZUFÜHREN`; `make smoke-selftest` runs the same smoke checks against local
processes.

## Verification
```bash
make sync           # regenerate every derived artifact (must leave no diff)
make verify         # mypy strict, import-linter, drift checks, backend tests, frontend typecheck, lints, all vitest
                    # suites incl. headless Chrome (geometry, visual regression, accessibility, live end-to-end)
make gate PHASE=05  # machine report docs/test-reports/phase-05.json with hash + recomputed STATUS.md
```

## Layout
| Path | Content |
|---|---|
| `backend/app` | contracts (Pydantic SSOT), fields F01–F06, experiments/orchestrator, API (F07 projections) |
| `frontend/src` | workspace F07: session, access, provenance, semiontics, language, shell, time, control, demo, views 01–11 |
| `frontend/semiontics` | sign register and term catalogue (EN/DE) — sources of all visible signs and words |
| `contracts/` | bundled JSON schema, coupling matrix, field manifests |
| `synthetic_fixtures/` | synthetic topology, governance, scenarios, observation configs, golden and regression bundles |
| `docs/` | architecture, STATUS, NEXT, session log, corrections, ADRs, traceability registry, test reports |
| `tools/` | report/status/trace tooling, lints, smoke test |

## Open external dependencies
DEP-01 (R/I operator semantics) · DEP-02 (real engine) · DEP-07a (Docker daemon in the build environment) ·
DEP-08 (Σ02–Σ29 labels). They are encapsulated contract-conformingly and never bridged by invented results.

© see `COPYRIGHT.md`.
