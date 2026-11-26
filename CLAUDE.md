# CLAUDE.md — CIRA Execution Contract v1.0.2 (Kurzform) · Sitzungsprotokoll

Architektur: **FROZEN v1.0.2** — SSOT `docs/architecture/SYNTX_CIRA_Consolidated_Architecture_Package_v1.0.2.md`
Freigabe: `docs/architecture/ARCHITECTURE_FREEZE_v1.0.2.md` · gate_mode **AUTO_INTERNAL** · Produktidentität CIRA (SYNTX nur intern).

## Sitzungsbeginn (E-11, 15.8)
1. Diese Datei lesen → `docs/STATUS.md` → `docs/NEXT.md` → `make resume`.
2. Zustand nur aus Dateien und einem frischen Testlauf rekonstruieren (E-13), nie aus Erinnerung.
3. Uncommittete Änderungen bei rotem Verify = unvollständige Einheit → RIVZ-Schritt 7.

## Arbeitsweise (E-04–E-10, RIVZ 15.5)
- Eine Einheit = Komponente + REQ-IDs + Tests. Test zuerst. Für Metriken: Golden Fixtures und Oracle vor dem Kern.
- Nach jeder Einheit: `make sync` → Wirkungsmenge (`make impact`) → `make verify` → Aufzeichnen
  (NEXT, SESSION_LOG, corrections, ADR) → Commit-Checkpoint mit REQ-IDs.
- Befundklassen E-07: F1 sofort korrigieren · F2 korrigieren + `docs/corrections.md` + kleine ADR ·
  F3 **nicht selbst umsetzen** → `docs/change-requests/`, Einheit pausieren · F4 DEP → Stub, BLOCKED_DEP.
- Abbruchregel: derselbe Test nach drei Korrekturdurchläufen rot → `docs/blocked/` mit Analyse.

## Verbotene Abkürzungen
- Keine erfundenen Ergebnisse (E-02): keine Engine-Ausführung, kein Testergebnis, keine Messung, die nicht entstanden ist.
  FIXTURE bleibt FIXTURE. Reports in `docs/test-reports/` schreibt nur `tools/report.py`.
- Kein Löschen, Überspringen, `xfail`, keine gelockerte Erwartung ohne F2-Korrektur oder ADR (E-09).
- Generierte Artefakte nie von Hand bearbeiten (E-10): `contracts/schemas/*`, `backend/.importlinter`,
  `synthetic_fixtures/bundles/fx_bundle_tx14.json`, `docs/STATUS.md`, `frontend/src/contracts/generated/*`, `docs/gui/*`,
  `frontend/src/semiontics/generated/*`, `frontend/src/language/generated/*`, `frontend/test/generated/*`,
  `frontend/test/snapshots/*`, `frontend/.dependency-cruiser.cjs`. Quellen: `frontend/semiontics/*.yaml`, G03.3, Backend.
- Visuelle Baselines (`frontend/test/visual/baseline/`) nur nach Sichtprüfung ersetzen; ein Lauf mit
  `CIRA_UPDATE_BASELINES=1` ist absichtlich rot (ADR-0005 Nr. 10).
- Sichtbarer Text nur aus `frontend/semiontics/cira.terms.yaml` (EN + DE); Rohwerte nur im technischen Datensatz.
- Keine Ignore-Einträge in Importregeln, Capabilities, Lints ohne ADR (E-16).
- Keine Geodaten, keine Realnamen, keine realen Infrastrukturmodelle (REQ-080).
- Keine Secrets committen (`.env` ist ignoriert).

## Befehle
| Befehl | Wirkung |
|---|---|
| `make sync` | regeneriert Schemas, .importlinter, TX14-Bundle, Snapshots, Semiontik, TS-Typen, depcruise-Regeln |
| `make verify` | alle Tests, mypy strict, import-linter, Drift, trace_check, Lints — 0 Fehler, 0 Skips |
| `make gate PHASE=0N` | Report `docs/test-reports/phase-0N.json` mit Hash, STATUS neu berechnet |
| `make status` · `make resume` · `make impact` | Status · Wiedereinstieg · Wirkungsmenge |
| `make run` | Backend auf 127.0.0.1:8000 |
| `cd frontend && npm run verify` | TS-Drift, tsc, lint-arch + depcruise, alle vitest-Suiten inkl. Chrome (`CIRA_CHROME`, Standard `/usr/bin/google-chrome`) |

## Externe Abhängigkeiten (vertragstreu gekapselt)
DEP-01 (R/I-Semantik) · DEP-02 (reale Engine: nur FIXTURE/IMPORTED, Local/Api als Stubs mit ENGINE_UNAVAILABLE) ·
DEP-07a (Docker-Daemon: AK-10 als EXTERN_AUSZUFÜHREN) · DEP-08 (Σ02–Σ29-Bezeichnungen: LABEL_UNAVAILABLE).

## Sitzungsprotokoll
Append-only in `docs/SESSION_LOG.md`.
