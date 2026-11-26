# ADR-0006 — Präzisierungen Phase 05 (Aggregation, Demo, Regression, Laufzeit)

Status: ACCEPTED
Datum: 2026-11-26 · Phase 05 · Klasse F2 (ohne Semantikwirkung, E-07)

## Entscheidungen
1. **Eine Aggregationsregel (07.7).** Jede Metrik mit Tickmenge erhält PER_TICK, POOLED und TIME_MEAN_EXPLICIT über
   `Evaluator.series` — auch M10 (Tickmenge = {Stabilitäts-Tick}, 07.3), M04 je Funktion und „alle Funktionen“ (je Tick
   gepoolt über die Funktionen) und M03 ohne Tickpaar (beide Aggregate INPUT_MISSING). Die Neuaggregation mit `to_tick`
   (#7) benutzt dieselbe Kernfunktion `metrics.aggregation.reaggregate`: Die gespeicherten Aggregate legen fest, welche
   Reihen existieren (UNDEFINED bleibt sichtbar); Werte entstehen aus den PER_TICK-Teilen ≤ `to_tick`. Gleiche
   Nicht-Zähler-Beschriftungen (`function_ref`, `shared_coverage`) bleiben erhalten, wenn alle Teile sie gleich tragen.
   Die POOLED-Identität (gespeichert = Neuaggregation bis zum letzten Tick) ist für fünf Experimentarten getestet.
2. **Demo-Schritte als Daten.** `frontend/src/demo/demo.steps.json` ist die einzige Quelle; `demo/script.ts` navigiert
   danach, `test_demo_flow.py` prüft jede erzählte Aussage gegen die API (AK-11). Die Parameter folgen den Fixture-Daten:
   Eingaben bei t wirken auf t+1 (ADR-0003), die erste Referenzänderung liegt bei t = 2 (n05 CLOSED → OPEN, beobachtet).
   M09 ergibt hier 3/4; die „3/5“ in G05.3 ist ein Beispiel der Architektur und wird nicht behauptet. Die Freigabe der
   Wiederherstellungsvariante ist die modellierte Entscheidung APPROVED der Rolle `role:supervisor` (APPLY_APPROVAL, t = 2);
   der Test prüft genau das. Die Hauptsequenz bleibt offen für RV-GUI-07.
3. **Regressionsbündel (T11, AK-13).** Unter `synthetic_fixtures/bundles/regression/` liegen eingefrorene Exportbündel mit
   einer Fallbeschreibung. Sie werden nie von `make sync` erzeugt; `scripts/freeze_regression.py --freeze` schreibt nur
   fehlende Bündel. Der Test baut jeden Fall neu, vergleicht den Export byte-genau, importiert das eingefrorene Bündel in
   eine leere Instanz und exportiert erneut. Eine gewollte Verhaltensänderung braucht eine neue Fallversion mit ADR.
4. **Laufzeitkette.** `docker-compose.yml` (Backend mit Healthcheck, statischer Frontend-Build) und `tools/smoke.sh`
   gegen eine laufende Instanz. Ohne Docker-Daemon wird AK-10 als `DEP-07a / EXTERN_AUSZUFÜHREN` geführt, nie simuliert.
   TX20/TX31 laufen gegen ein echtes uvicorn mit dem Produktions-Build im Browser (DEP-07b gemessen).
5. **Freihändige Wiedergabe für Aufnahmen.** „Play demo“ in der Demo-Leiste geht alle Schritte selbst durch,
   `seconds_per_step` (10 s) aus `demo.steps.json`, also 80 s für 8 Schritte, im Präsentationsmodus. Reine Navigation
   (INV-FUN-07, kein POST); Escape, „Stop“ oder jede manuelle Navigation beenden die Wiedergabe. Belegt durch einen
   DOM-Test mit Zeitraffer und einen 80-s-Lauf in Chrome gegen das laufende Backend (TX31).
