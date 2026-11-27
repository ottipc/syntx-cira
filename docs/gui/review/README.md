# Review-Paket GUI-Generation v2 (U00–U30)

Branch `feature/semiontic-gui-v2` ab `main` = `ac5073b` (unberührt). Architektur v2.0.3 (eingefroren), ADR-0008 mit einer
Zeile je Einheit. Stand dieses Pakets: U00–U30, Checkpoints CP1–CP7 (Tags `v2-cp1…7`).

## Was sich geändert hat (Felder N01–N12)

- **N01 Tokens/Generator:** Rollen-, Fokus-, Dekor-, Licht-, Tiefen-, Motion- und Komponenten-Tokens; Präsentationsskala als
  Gesetz in reinem CSS (`clamp(B px, (1,25·B/10,8) vh, 1,25·B px)`), Projektorprofil.
- **N02 Bühne:** deterministischer Emblem-Anker, Fit-Regel, Bühnenklasse; Kompositionsklassen `reserve`/`plate` je Ansicht.
- **N04 Umgebung:** Netz, Emblem, Licht, Vignette, Governor (Frame-Budget), R11-Dämpfung als ein Bit.
- **N05 Zeichen:** SEM-038 „Mit Auswahl verknüpft“, Abwesenheitsträger gehärtet (Ausnahmeset, keine Bewegung, Void-Grund).
- **N06 Fokus/Resonanz:** FocusScope, Resolver aller 11 Ansichten (reine Auswahl über dokumentierte Felder), Fokus-Carry,
  Herkunfts-Echo.
- **N07 Bewegung:** Phasenmaschine, MotionBoundary, MOT03–MOT19.
- **N08 Zeit:** TickRail mit neutralem Ring.
- **N09 Zahlen:** zahlenzentrierte Metrikkarten, RationalBar.
- **N10 Ansichten:** ViewFrame und Kompositionsklasse in allen elf Ansichten.

Unverändert gegenüber `main`: Backend, Verträge, `demo.steps.json`, Request-Inventar (V3T03/V2T01).

## Prüfungen (neu, alle in `make verify`)

V3T01, V3T03/V2T01, V3T04, V3T05, V3T06/V2T20 (Einheit und Browser), V2T04/V3T02, V2T06 (+ Stress), V2T07, V2T08,
V2T09, V2T17, V2T18, V2T19, V2T21, V2T22, V2T25 (22 Fälle), V3T07, V3T08, V3T09, V3T11, V3T12, V3T13, V3T14, V3T17,
V3T19 (8), Bildaudits 08.4 für MOT03–MOT18, TX28 um 66 DE-Fälle, TX29 auf 33 Baselines (1440×900 EN, 1920×1080
Präsentation EN, 1280×720 DE). Letzter Lauf: **780/780, 0 Skips** (vor U30-Dokumenten).

## Korrekturen (F2, `docs/corrections.md`)

IC-19 Registerliste DEC-01…08 · IC-20 T09 deterministisch · IC-21 TX28 misst Schublade nach ihrer Bewegung ·
IC-22 Kettenbasis wie in P0-R2 gemessen (Architekturtext 136 px ist der Wert bei Skala 1,25) · IC-23 Zeichenumrisse
SEM-014/018/027/032 in `ink.secondary` (V2T25).

## Baselines und Sichtprüfung

Jeder Ersatz mit Protokoll unter `docs/gui/inspection/` (U07-U08, U11-U13, U14-U15, U16, U19 … U29).

## Messungen U30 (relativ, nicht absolut)

Lauf `u30`, headless Chrome mit Software-Rendering, gleiche Umgebung, nacheinander; 30 s Demo-Wiedergabe ab Ansicht 01
(Präsentation 1920×1080) mit aktivem Umfeld. Evidenzdatei `frontend/test-results/inspection/u30/perf.json`.

| Größe | `main` ac5073b | Branch |
|---|---|---|
| Frames in 30 s | 1461 | 1431 |
| Frame-Intervall Median | 16.7 ms | 16.7 ms |
| Frame-Intervall p95 / p99 | 33.4 / 49.9 ms | 66.6 / 83.3 ms |
| Long Tasks | 0 | 0 |
| Umfeld-Zustände im Lauf | — | active, static |
| Build komprimiert (gzip -9) | 883,892 B | 1,150,943 B |

- **V2T15 Größe:** +267,051 B komprimiert (< 500 KiB). Davon Emblem-Grafiken ≈ 274 KB
  (emblem-full 180 KB, emblem-calyx 95 KB), JS +8,8 KB, CSS +3,9 KB.
- **V2T23 Laufzeit:** Median gleich; p95/p99 auf dem Branch höher, solange das Umfeld läuft — der Software-Renderer
  braucht dafür ≈ 37 ms je Frame (U20). Der Governor schaltet das Umfeld nach 120 Frames korrekt auf `static` (05.6.3).
  Keine Long Tasks in beiden Ständen. Absolute Budgets (05.13) nur auf Referenz-Hardware messbar (DEP-V3-05).

## Offen / extern

- **V2T24 Wahrnehmungsstudie:** Kit unter `docs/gui/perception/` (Aufgaben P1–P6, Bedingungen, URL-Skript
  `frontend/scripts/perception-urls.mjs`); Durchführung braucht Menschen (OD-04), keine Ergebnisse erhoben.
- **Absolute Performance:** Referenz-Hardware des Owners (DEP-V3-05).
- **MOT08 Schließen der Schublade mit Bewegung:** bewusst nicht umgesetzt (das `hidden`-Attribut nimmt Zone E sofort aus
  dem Layout; verzögertes Schließen änderte die Bedienlogik) — vermerkt seit U19.
- **AK-10 Compose-Kette:** ohne Docker-Daemon weiterhin DEP-07a (unverändert).

## Wiedergabe für den Owner

`git fetch <bundle> "+feature/semiontic-gui-v2:feature/semiontic-gui-v2" "refs/tags/v2-cp*:refs/tags/v2-cp*"`, dann
`make verify`, `make run` + `make run-frontend`; Prüfansichten: `npm run inspect` (132er-Matrix), `npm run inspect:motion`
(Kontaktbögen), `CIRA_MAIN_DIR=<checkout von ac5073b> npm run inspect:perf` (Vergleich).
