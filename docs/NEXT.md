# NEXT

## GUI-Generation v2 (Branch `feature/semiontic-gui-v2`, ADR-0008)

Architektur v2.0.3 eingefroren, Owner Implementation Release erteilt (2026-11-27). Einheiten U00–U30 nach
Kapitel 09.2/12 der Architektur. Stand: **U00–U15 erledigt** (CP1–CP3 getaggt `v2-cp1…3`; U14 FocusScope, U15 Fokusfeld
Ansicht 03 als Pilot). Nächste Einheit **U16** (Resonanz-Resolver der übrigen Sichten nach 04.4, danach U17 Carry → CP4).
`main` bleibt auf `ac5073b`; Übergabe je Checkpoint als Git-Bundle.

Offen aus U15 für spätere Einheiten: schmale Attributspalte in Ansicht 03 bei DE-Präsentation 1280×720 (Umbruch
„Weicht vom Referenzwert ab“) gehört zur Kompositionsarbeit U23/U27.

## Vorher offen (unverändert)

Phasen 01–05 abgeschlossen (Gate 05 bestanden, Report `docs/test-reports/phase-05.json`). Offen und außerhalb dieser
Umgebung bzw. dieses Mandats:

1. **AK-10 / DEP-07a** — auf einem Rechner mit Docker-Daemon: `make compose` (compose up --build --wait + `tools/smoke.sh`),
   danach `make gate PHASE=05`; der Report führt dann die Suite `smoke` und setzt AK-10 nach ihrem Ergebnis.
2. **DEP-02** — reale Engine anbinden (LocalAdapter/ApiAdapter); bis dahin bleiben alle Rekonstruktionen FIXTURE.
3. **DEP-01 / DEP-08** — R/I-Operatorsemantik und Σ02–Σ29-Bezeichnungen aus dem Engine-Register; GUI zeigt
   „Label not yet provided“ (LABEL_UNAVAILABLE).
4. **RV-GUI-07** — Demo-Zeitfenster und Hauptsequenz bestätigen (`frontend/src/demo/demo.steps.json`, Test AK-11).
5. Push: Schreibzugriff auf `ottipc/syntx-cira` in dieser Umgebung nicht gewährt — Commits liegen lokal; Übergabe als
   Git-Bundle/Patch möglich.
