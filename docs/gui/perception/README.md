# Wahrnehmungsstudie V2T24 — Protokoll-Kit

Architektur v2.0.3, 08.6. Durchführung braucht Menschen (OD-04); dieses Kit bereitet sie vor. Es enthält **keine
Ergebnisse** — die Studie ist nicht durchgeführt (E-02).

## Bedingungen

| Achse | Werte |
|---|---|
| Stand | `main` (ac5073b) · Branch `feature/semiontic-gui-v2` |
| Sprache | EN · DE |
| Modus | Standard · Präsentation |
| Daten | Fixture-Experiment „Baseline“ (`exp:0c7da892f472-0`), Tick 3; für P2b das Sparse-Experiment (`exp:92b81e996185-0`, Tick 4 ohne Rekonstruktion) |

Zuweisung: jede Person sieht beide Stände (Reihenfolge ausbalanciert), je Aufgabe eine Sprache/Modus-Kombination
nach Plan. URLs je Bedingung: `node frontend/scripts/perception-urls.mjs <main-basis-url> <branch-basis-url>`.

## Aufgaben P1–P6

| ID | Aufgabe (an die Person) | Ansicht | Richtig ist | Erfasst |
|---|---|---|---|---|
| P1 Raum-Triade | „Zeige für `attr:n08/state` den Referenz-, den beobachteten und den rekonstruierten Wert.“ | 03 | drei Zellen in Spalte A, O, R | Treffer, Zeit, Verwechslung A/O/R |
| P2 Abwesenheit vierfach | „Welche der markierten Zellen ist (a) nicht beobachtet, (b) nicht bestimmt, (c) außerhalb des Beobachtungsfensters, (d) keine Rekonstruktion zu diesem Tick?“ | 03 Baseline t3 (a–c), 03 Sparse t4 (d) | SEM-006, SEM-007, SEM-031 (Baseline t3), SEM-009 (Sparse t4) | Treffer je Klasse, Verwechslungsmatrix |
| P3 Herkunft | „Woher stammt die Kennzahl M02 (Referenz)? Zeige die Quelle.“ | 09 → Zone E | Herkunftsschublade mit Artefakt-Id | Treffer, Zeit, Schritte |
| P4 Ansichtsübergreifende Spur | „Wähle Knoten n08 in der Topologie und finde seine offene Lücke.“ | 02 → 07 | Lücke `gap:t3:unobserved_n08` | Treffer, Zeit, Ansichtswechsel |
| P5 Metriken | „Sind M05 und M11 dieselbe Aussage? Gibt es einen Gesamtwert?“ | 09 | nein (Komplement-Notiz M01/M11); kein Gesamtwert | Treffer, Begründung frei |
| P6 Komfort / reduzierte Bewegung | „Arbeite 2 min in 01 → 03 → 09 (einmal mit, einmal ohne reduzierte Bewegung). Wie ruhig/ablenkend?“ | 01, 03, 09 | — (Skala 1–5) | Skala, freie Notiz |

## Auswertung (Annahmekriterium 08.6)

- Keine Verschlechterung der Trefferquote kritischer Aufgaben (P1, P2, P4) gegenüber `main`.
- Keine neue Zeichenverwechslung (Verwechslungsmatrix P2 und A/O/R in P1).
- Zeiten nur beschreibend.

Erfassungsbogen je Person: `participant`, `bedingung`, `aufgabe`, `treffer (0/1)`, `zeit_s`, `fehler_zeichen`,
`notiz`. Datei pro Durchgang als CSV neben diesem Kit ablegen; die Auswertung ist nicht Teil des Repos.
