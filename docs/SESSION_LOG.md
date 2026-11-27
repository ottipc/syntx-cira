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

## 2026-11-27 — GUI-Generation v2, U01–U15
- U01–U13 einzeln committet (siehe ADR-0008, Tabelle); Checkpoints CP1 (pixelgleich), CP2, CP3 getaggt und als Bundle übergeben.
- Korrekturen IC-19 (Registerliste DEC-01…08) und IC-20 (T09 deterministisch durch gehaltene Antwort; Erwartungen unverändert).
- U14/U15: Fokusfeld Ansicht 03. Befund: Chrome zeichnet 1,5-px-Rahmen als 1 px → SEM-038 als `inset`-Schatten; ererbte
  Textfarbe der gedämpften Zeile erreichte Abwesenheitsträger → Farbe nur auf nicht ausgenommene Zellen gesetzt.
- `make verify`: 560/560 vitest, pytest grün, 0 Skips, 0 Lint-Befunde.

## 2026-11-27 — GUI-Generation v2, U16–U17 (CP4)
- U16: Resolver aller Ansichten gegen Snapshots mit unabhängigem Orakel (V3T06/V2T20); Befund: Fokus-Ids müssen StableIds
  sein (K-01), sonst verwirft der URL-Parser sie — Felder, Stufen, Metrikkarten, Eimer-Einträge, Stufenereignisse
  erhalten StableId-Formen; Resolver 09/11 lieferten den Fokus selbst mit (durch Test gefunden, behoben).
- Zwei Layoutbefunde vor Baseline-Ersatz behoben (Stapelabstand durch Scope-Hülle, Griff ohne eigene Zeilenbox);
  2 Baselines ersetzt (01, 07) mit Protokoll `docs/gui/inspection/U16.md`.
- U17: Fokus-Carry (V2T21), CP4. `make verify` 589/589, 0 Skips.

## 2026-11-27 — GUI-Generation v2, U18–U20 (CP5)
- U18: Motion-Tokens, Phasenmaschine, MotionBoundary, `data-motion` an Blöcken.
- U19: MOT03/04/05/07/08/11/13/14 mit Bildaudit (08.4) und Kontaktbögen; Korrektur IC-21 (TX28 misst Schublade nach
  ihrer Eintrittsbewegung, Erwartungen unverändert).
- U20: MOT10/12/15/16/18, V2T09, V2T18, V3T14; MOT09/MOT17 an ihre Träger in U22/U21 gebunden.
- Befund Testumgebung: Software-Renderer ≈ 37 ms/Frame mit aktivem Umgebungsfeld → Governor schaltet korrekt auf static;
  Harness-Skript `steady-frames` nur für V2T18.
- `make verify` 631/631, 0 Skips. CP5.

## 2026-11-27 — GUI-Generation v2, U21–U27 (CP6)
- U21 TickRail, U22 RationalBar/Metrikkarten, U23 ViewFrame/Komposition (Korrektur IC-22: Kettenbasis wie in P0-R2
  gemessen), U24–U26 alle Ansichten in ViewFrame mit Kompositionsklasse, U27 Präsentationsskalengesetz in reinem CSS.
- Befund U27: Präsentationsmodus skalierte bisher nichts (Tokens bei `:root` aufgelöst, G3-29/G3-37) — jetzt Gesetz je
  Token in der Präsentationsschale; Rundungsartefakt 34,9996 px durch aufgerundeten vh-Koeffizienten behoben.
- `make verify` grün; CP6.

## 2026-11-27 — GUI-Generation v2, U28–U30 (CP7)
- U28: TX28 + 66 DE-Fälle (Befunde: Dokumentsprache, Leistenumbruch, kompakte Pille), TX29 auf 33 Baselines.
- U29: V2T25 (Befund IC-23 Zeichenumrisse; Ansicht-03-Zeilen ohne `data-focus-id`), V2T22, V2T06-Stress.
- U30: Vergleich Branch vs `main` (relativ), Wahrnehmungs-Kit, Review-Paket, Gate Phase 05.
- Gate Phase 05 (erster Lauf nach U30): **nicht bestanden** — V3T17(b) rot unter Last (Governor wechselte zwischen zwei Stichproben); Korrektur IC-24, Bericht dieses Laufs nicht übernommen, Gate neu gestartet.
- Gate Phase 05 (zweiter Lauf, Commit `90d77e5`): **bestanden** — 1027 Tests, 0 fehlgeschlagen, 0 übersprungen, alle Drift-Prüfungen grün, Bericht `docs/test-reports/phase-05.json` (`sha256:7dbd652a…`). CP7.
