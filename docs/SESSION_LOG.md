# SESSION_LOG (append-only)

## 2026-11-26 — Session 1 (Freeze & Release v1.0.2)
- Repository erfasst (README, Lizenz Apache-2.0). Lizenz entfernt → `COPYRIGHT.md` (All Rights Reserved). `.gitignore` angelegt.
- Architektur v1.0.2 als SSOT unter `docs/architecture/`, Vorversionen unter `history/`, Eingänge unter `inputs/`.
- `ARCHITECTURE_FREEZE_v1.0.2.md` geschrieben. Commit `3270a9e`.
- Push: Schreibzugriff auf `ottipc/syntx-cira` wurde in dieser Umgebung nicht gewährt (add_repo mit push abgelehnt);
  Arbeit erfolgt auf einem lokalen Klon, Commits liegen lokal vor.
- Phase 01: core, 27 Verträge, Schemaexport, TX14-Durchstich, Kopplungsmatrix + import-linter, CAS-Store mit Capabilities,
  topology, governance (K3), Golden Fixtures (22), Oracle, M01–M11, Nachweisfeld (registry, trace_check, report, status).
- Befunde IC-01–IC-05 (alle F2) → `docs/corrections.md`, ADR-0001, ADR-0002.

## 2026-11-26 — Session 2 (Phasen 02–04, fortgesetzt nach Kontextwechsel)
- Phase 02: Emulator (Szenariopaar FX-SCN-BASE/REC), Beobachtung (θ, ω, Profile, Budget), Orchestrator-Stufen
  Definitionen/Emulation/Beobachtung, SYNTHETIC-Replay. Gate 02 bestanden (`810cd5b`).
- Phase 03: F05-Adapter (Fixture, Import, Local/Api-Stubs mit ENGINE_UNAVAILABLE), unabhängige Sweeps, Merge
  engine_first/v1, Deltas, Registry-Labels; F06-Bewertung aller drei Räume, Vergleich (M09); 21 API-Einträge mit
  Projektionstypen; IC-06–IC-09, ADR-0003/0004. Gate 03 bestanden (`fed3197`).
- Phase 04 (F07): Semiontik-SSOT + Katalog EN/DE → Generatoren; TS-Verträge (Wire-Form); Teilfelder Session, Access,
  Provenance, Sprache, Shell, Zeit, Steuerung (#21 vorbereitet, gesperrt), Demo; Sichten 01–11; Kompositionswurzel.
- Prüfwerkzeuge: lint-arch (TX24/TX26/kanonische Zeichen/Token-CSS), dependency-cruiser aus G03.3 (TX25),
  vitest-Suiten TX15/19/22/23/24/27/30/33, T09, Browser-Suiten TX28/29/32 mit Chrome for Testing 153.
- Snapshots in Client-URL-Form, viertes Experiment mit dünnem Sweep-Plan (Nicht-Sweep-Ticks).
- Befunde IC-10–IC-14 (alle F2), ADR-0005. Sichtprüfung der Baselines führte zu Korrekturen (Topologie-Lesbarkeit,
  Formel-Schreibweise, Zone D) und zu neuen TX28-Regeln.
- Push weiterhin nicht möglich (Schreibrecht in dieser Umgebung nicht gewährt); alle Commits lokal.
- Gate 04 bestanden (667 Tests, `sha256:22c44834…`).
- Phase 05: Demo-Flow-Test (8 Schritte gegen die API), eingefrorene Regressionsbündel (4 Fälle), TX20/TX31 gegen
  laufendes uvicorn + Produktions-Build in Chrome, Compose/Dockerfiles/Smoke (Daemon fehlt → DEP-07a), README.
- Befunde IC-15 (07.7-Aggregation unvollständig, gespeichert ≠ Neuaggregation), IC-16 (Fokuszeichen, Maskierung von
  Mehrfachblöcken), IC-17 (Steuerungsmenü außerhalb des Viewports) — alle F2, ADR-0006.
- DEP-GUI-01 geschlossen (TX30), DEP-GUI-02 gepinnt.
- Nach Gate 05: freihändige 80-s-Demo („Play demo“), IC-18 (Lesen während Lauf), Push durch OB von seinem Rechner.
- Gestaltung nach Auftrag OB (ADR-0007): Logo-Zeichen (ohne Schriftzug), Markenfarbe, neuronales Feld, Kette in Sicht 01,
  Dekor als eigener bedeutungsfreier Registerabschnitt mit Prüfungen.

## 2026-11-27 — GUI-Generation v2, U00
- Freeze der Architektur v2.0.3 (F01–F03) nach Freigabe Owner, GPT, Gemini und Claude; Owner Implementation Release.
- Branch `feature/semiontic-gui-v2` ab `ac5073b` (der lokale README-Commit `5641f17` ist nicht Teil des Branches).
- Ausgangslage auf dem Branch: `make verify` grün (vitest 483/483, pytest grün, 0 Lint-Befunde).
- ADR-0008-Rahmen mit den eingefrorenen Owner-Entscheidungen; Architektur unter `docs/architecture/gui-v2/`.
