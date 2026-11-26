# ADR-0005 — Präzisierungen der F07-Umsetzung (Phase 04)

Status: ACCEPTED
Datum: 2026-11-26 · Phase 04 · Klasse F2 (ohne Semantikwirkung, E-07)

## Kontext
Kap. 11 und G01–G06 legen die Sichten, Zeichen, Tokens, Kopplungen und Prüfungen des Frontends fest. Bei der Umsetzung
waren Einzelheiten offen, die keine Semantik ändern, aber festgehalten werden müssen, damit Tests und Generatoren sie
prüfen können. Jede Entscheidung unten ist durch den genannten Test belegt.

## Entscheidungen
1. **Monospace-Schrift.** Gebündelt wird DejaVu Sans Mono über `@fontsource/dejavu-mono` 5.3.0 (Sans: IBM Plex Sans 5.3.0).
   JetBrains Mono deckt nicht alle Registerglyphen ab; Iosevka setzt Pfeile doppelt breit. TX30 prüft Abdeckung
   (13 kanonische Zeichen, Σ, alle SEM-Glyphen, alle Nicht-ASCII-Zeichen des Quellcodes), eine einzige Vorschubbreite und
   Glyphenboxen innerhalb von Ascent/Descent. Deshalb trägt `BarrierLine` nur ‖ (Registerglyph); ║ überschreitet den Ascent.
2. **Eigenes Graph-Layout statt elkjs.** `views/02-topology/layout.ts` ist eine reine Funktion von (Topologie, `graph.*`-Tokens):
   Ebene = längster Abhängigkeitspfad, Ebenen von oben nach unten, innerhalb der Ebene nach `node_id` sortiert, Breite aus
   Zeichenzahl × `graph.node.char_width`; ohne DOM-Messung. Neu ist `graph.node.slot_chars` (12), damit Werte in ihren
   Slot passen, ohne dass das Layout Werte kennt. Der Graph wird in natürlicher Größe gezeichnet und scrollt; er wird nicht
   verkleinert (Lesbarkeit). TX33 (byte-identisch, reihenfolgeunabhängig, überlappungsfrei), TX28 (Text im Knoten, ≥ 9 px).
3. **SEM-037 Kopplungslinie.** Kopplungsstatus (EFFECTIVE/POSSIBLE/UNKNOWN_OPEN, K-63/GK-04) wird als Überlagerung der
   achromatischen Topologiekante in Rekonstruktionsfarbe gezeichnet; die Bindung `CouplingStatus` steht im Register.
   TX22 prüft Eindeutigkeit und Kanalfreiheit.
4. **Wire-Form der TS-Verträge.** `scripts/gen-contracts.mjs` normalisiert vor der Generierung: Pydantic-Tupel
   (`prefixItems`) werden als Tupel ausgegeben; alle Properties sind Pflicht, weil der Server jedes Feld serialisiert
   (`model_dump` ohne `exclude_*`). Das Schema selbst bleibt unverändert (TX02).
5. **Snapshots in Client-Form.** `gen_snapshots.py` fordert exakt die URLs an, die `access/endpoints.ts` baut
   (`attempt=0`, `aggregation=POOLED` …); der Test-Server vergleicht Query-Parameter reihenfolgeunabhängig, jede Lücke ist ein
   Testfehler. Ein viertes Experiment mit `sweep_schedule EXPLICIT [1, 3, 5]` liefert Nicht-Sweep-Ticks (AK-GUI-05); sein
   M03 Ω_R ist ehrlich UNDEFINED/INPUT_MISSING (keine aufeinanderfolgenden verfügbaren Tickpaare) und die Auswertung PARTIAL.
6. **Rechenverbot, Geltungsbereich (TX26).** Geprüft wird `src/views/**` mit AST: keine Arithmetik, keine Größenvergleiche,
   kein `Math.*`, kein `reduce`, kein `filter().length`, kein Wertvergleich `x.value === y.value`. Erlaubt sind Vergleicher
   direkt in `.sort(…)` von ViewModel-Dateien (Ordnung, keine Domänenrechnung) und die reine Layoutfunktion (2.).
   Layoutrechnung in Shell, Semiontik und Zeit ist keine Domänenrechnung.
7. **Kanonische Zeichen (K-31).** Die 13 Operatorzeichen, Σ und ihre Doppelgänger stehen in Code-Literalen nur in
   `EngineToken`; UI-Pfeile nur ▸ ▾ ◀ ▶. Formeln der Metrikdefinitionen sind Serverdaten (`data-datum="formula"`), werden
   unverändert gezeigt (keine Groß-/Kleinschreibungstransformation, TX28) und gelten nicht als Produkttext.
8. **Daten vs. Produkttext (INV-LANG-04).** Rohwerte des Vertrags (aux-Zähler, Backend-Meldungen von ErrorRecords) erscheinen
   nur im technischen Datensatz der Herkunftsleiste. Sichtbar sind Fehlercode und Wiederherstellungsaktion über
   `TERM_ErrorCodeC`/`TERM_RecoveryAction`; Befehlsfehler ebenso (`action.failed` als Katalogbegriff ohne Code).
9. **Tokens.** Neu: `zone.e.dock_from` (1600, G03.10) und `graph.node.slot_chars`. Media Queries können keine
   CSS-Variablen lesen; px in `@media` sind nur als Zonentoken (oder Token − 1) zulässig. Jede `var(--…)` muss ein
   definiertes Token sein (lint-arch).
10. **Visuelle Baselines (TX29).** Laut Freigabeauftrag stammen sie aus dem ersten sauberen Lauf; sie wurden nach Sichtprüfung
    übernommen (1440 × 900, Standardmodus, Baseline-Experiment t = 3). Ein Lauf mit `CIRA_UPDATE_BASELINES=1` schreibt die
    Bilder und ist absichtlich rot, damit ein Aktualisierungslauf nie als Prüfung gilt. Toleranz 0,1 % Pixel (pixelmatch 0,1).
11. **Komponentenzuschnitt.** Gemeinsame Teile der Sichten 05/06 (Lauf-Kopf, Trace, Ausgabe-Tabs) liegen in
    `views/_common/RunParts.tsx` (gleiches Teilfeld F07.7); Metrikanzeige in `views/_common/MetricValue.tsx`.
    Die Kompositionswurzel `App.tsx` ist das einzige Modul, das alle Sichten kennt.

## Folgen
Keine Semantikänderung; Register, Katalog und Matrix bleiben SSOT, alle Generatoren haben `--check` (make sync/verify).
