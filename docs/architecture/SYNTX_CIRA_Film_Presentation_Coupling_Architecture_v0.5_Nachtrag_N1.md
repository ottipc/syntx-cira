# SYNTX :: CIRA — Nachtrag N1 zur Kopplungsarchitektur v0.5 (FROZEN): Filmaustausch v2.1 und vorgelagerte GUI-Relation

| Kopf | Wert |
|---|---|
| Bezug | `SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md`, §11 Austauschbarkeit |
| Status | Nachtrag; ändert keine Feld-, Anker- oder Invariantendefinition von v0.5 |
| Datum | 2026-11-27 |
| Freigaben | Owner, Gemini, GPT: Variante B für Schritt 6; Owner: ansichtsspezifische Abweichung (Ansicht 09) |
| GUI-Seite | `feature/semiontic-gui-v2`: Architektur v2.0.3, Nachtrag **F04**, **ADR-0009**, IC-25 |

## 1 — Vorgelagerte Relation (neu)

Das Filmfeld K1 hat eine Quelle außerhalb dieses Dokuments: die Demo-Wiedergabe der GUI. Was der Film in einem Schritt zeigt,
legt die GUI fest. Seit v2.1 ist diese Relation für den harten Anker A5 ausdrücklich gebunden:

```text
demo.steps.json Schritt 6 (focus = metric:m11/a_r///)
   → FocusScope (N06) · Kontextführung R13 ← MetricBand (N10, data-carry-anchor)
   → Komposition Ansicht 09: Bandkopf RECONSTRUCTION · M05 + M01 resonant · M11 fokussiert · M06 außerhalb
   → Aufnahme Play demo → Film (K1) → Manifest: A5-Fenster gemessen
   → Narration A5a/A5b (K4) im Fenster (I10)
```

| Relation | Träger | Gesetz | Nachweis |
|---|---|---|---|
| GUI → K1 | `demo.steps.json` Schritt 6 + R13 | M05 und M11 auf allen vier Bühnen vollständig im Bild | V3T20 (GUI), Standbilder `presentation/coupling/v2.1/stills/A5_stage_*.png` |
| K1 → Anker | `film.manifest.json` v2.1, `anchor_check` | Das A5-Fenster beginnt mit der stabilisierten Metrikkomposition und wird nach jeder Aufnahme neu vermessen | Manifest v2.1: Frame 1530, Bühne 121,0–130,2 s |
| Anker → K4 | Sprechhinweis S04, Sprachprobe | A5a und A5b satzvollständig im Fenster | integrierte Prüfung P5, P7 |

Ändert sich auf der GUI-Seite Schritt 6, die Ansicht 09 oder R13, gilt der Film als neu: neue Aufnahme, neues Manifest,
neue Ankerprüfung (§11).

## 2 — Austausch nach §11

| Größe | v1 (ac5073b) | semiotic v2 | **semiotic v2.1 (gültig)** |
|---|---|---|---|
| Datei | `video/CIRA_Product_Film_80s.mp4` | `video/CIRA_Product_Film_80s_semiotic_v2.mp4` | `video/CIRA_Product_Film_80s_semiotic_v2.1.mp4` |
| Manifest | `presentation/coupling/film.manifest.json` | `presentation/coupling/v2/film.manifest.json` | `presentation/coupling/v2.1/film.manifest.json` |
| A5 | erfüllt | **verletzt** | erfüllt, Bühne 121,0–130,2 s |
| Schritte / Dauer | 8 / 80,000 s | 8 / 80,000 s | 8 / 80,000 s |

Narration und Timeline sind unverändert (`presentation/coupling/config/`, wortgleich mit der HTML-Bühne). Abgeleitet und neu
erzeugt wurden nur der Sprechhinweis zum A5-Fenster in den S04-Notizen (I9) und die Sprachprobe v2.1. Die Probe bleibt
wortgleich; nur der hintere Block in S04 beginnt bei 121,2 s statt 120,25 s und wird dafür etwa 3 % schneller gesprochen.

## 3 — Fallback-Ordnung

| Rang | Fassung | Film | Bemerkung |
|---|---|---|---|
| 1 | `CIRA_EDTH2026_MANUAL_v2.pptx` / `CIRA_EDTH2026_AUTO_180s_v2.pptx` | v2.1 | gültig, A5 erfüllt |
| 2 | `CIRA_EDTH2026_MANUAL.pptx` / `CIRA_EDTH2026_AUTO_180s.pptx` | v1 | gültig, A5 erfüllt, GUI v1 |
| 3 | `presentation/fallback/semiotic_v2_A5_verletzt/` | v2 | nur mit dokumentierter Abweichung von I10 |

Sprachproben: `…_Stimme_v2.1.mp4` gehört zu Rang 1. `…_Stimme.mp4` und `…_Stimme_CLEAN.mp4` gehören zu Rang 2 (v1-Timing, unverändert).

## 4 — Prüfung

`python3 presentation/coupling/v2.1/integrated_check.py` prüft Fallback-Bestand, Film, Manifest, Timeline, beide Fassungen,
Wortlaut und Zeitlage der Sprachprobe, Tonspur und Probe-Video. Ergebnis und Befunde stehen in
`presentation/coupling/v2.1/INTEGRIERTE_PRUEFUNG_v2.1.md`.
