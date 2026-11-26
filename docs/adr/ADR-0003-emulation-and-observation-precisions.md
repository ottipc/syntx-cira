# ADR-0003 — Präzisierungen in Emulation und Beobachtung (F2)

Status: ACCEPTED
Datum: 2026-11-26 · Phase 02 · Klasse F2 (ohne Semantikwirkung, E-07)

## Kontext
Kap. 04 (F03, F04), 08.4, 08.5 und K-09, K-12, K-66 lassen Einzelheiten offen, die für eine deterministische
Implementierung festgelegt werden müssen. Keine dieser Festlegungen ändert Feldrelationen, Kopplung, Zugriffsmatrix,
Zustandsraumtrennung oder Metrikdefinitionen.

## Entscheidungen
1. **Zeitbezug der Eingaben.** Ω_A(t+1) = T(Ω_A(t), u_t): Ein Input mit `tick = t` wirkt ab Ω_A(t+1).
   Zulässige Input-Ticks: 0 … tick_count − 2. `ActualState.last_seq` ist die letzte bis einschließlich Ω_A(t) wirksame Sequenz.
2. **Freigaben als Zustand (REQ-016, K-66).** `APPLY_APPROVAL` setzt das Zielattribut auf das Symbol der Entscheidung:
   APPROVED → AUTHORIZED, REJECTED → DENIED, PENDING → PENDING. Liegt das Symbol nicht in der Domäne, ist das
   strukturell ungültig (INVALID_TRANSITION). Hat die Rolle kein `permits` für `rule_ref`, entsteht `EventRecord` REJECTED
   ohne Zustandsänderung; der Grund steht als ErrorRecord am Ereignis.
3. **ω(i,t)** wertet die Beobachtungen des Kontexts t aus (Observation.tick = t). Veraltung entsteht über `lag_ticks`
   (`observed_at_tick < tick`, `stale`).
4. **Sichtbarkeit.** Beobachtungen und Platzhalter entstehen nur für Attribute sichtbarer Knoten. Quellen dürfen nur
   Attribute sichtbarer Knoten beobachten (sonst SCHEMA_VIOLATION bei der θ-Prüfung); sichtbare Relationen verbinden nur
   sichtbare Knoten. ω liefert für alle übrigen Attribute UNKNOWN bzw. NOT_APPLICABLE aus der Deklaration.
5. **Serialisierungsprofile (verlustfrei).** `full`: alle Beobachtungen inkl. Platzhalter. `compact`: nur KNOWN
   (UNKNOWN folgt aus ω, NOT_APPLICABLE aus der beobachtbaren Deklaration). Budgeteinheit `items_bytes/v1`:
   observations = Σ |observations|, bytes = |canonical(contexts)|.
6. **Budgetverlauf (K-12, D-18).** Profile werden der Reihe nach versucht; ein Wechsel bleibt für folgende Ticks bestehen.
   Jeder überschrittene Versuch erzeugt einen ErrorRecord CONTEXT_INCOMPLETE (RESERIALIZE) als StageEvent. Ein Bundle über
   Budget wird nie ausgeliefert. Sind alle Profile erschöpft, entsteht für den Tick kein Bundle und kein ObservationRecord;
   die Stufe OBSERVATION endet PARTIAL, die Sweeps dieses Ticks werden BLOCKED (Phase 03).
7. **experiment_id** = `exp:` + sha256(canonical(ExperimentDefinition))[:12] + `-n` (laufende Nummer je Definition).
   Keine Payload-ID hängt davon ab (K-56, TX16).
