# ADR-0008 — Neurovisuelle GUI-Generation (Architektur v2.0.3)

Status: ACCEPTED (Rahmen) · Einträge je Einheit U00–U30
Datum: 2026-11-27 · Branch `feature/semiontic-gui-v2` ab `ac5073b` · Klasse F2 (Gestaltung ohne Semantikwirkung, E-07)
Grundlage: `docs/architecture/gui-v2/…_v2.0.3.md` (eingefroren, Freigabe Owner, GPT, Gemini, Claude; Owner
Implementation Release DEP-V3-01 vom 2026-11-27). `main` bleibt auf `ac5073b`.

## Rahmen
- Keine Änderung an Backend, Verträgen, Schemas, Endpunkten, Anfragen, Metriken, eingefrorenen Bündeln,
  `demo.steps.json`, Produktfilm oder `main`. Sichtbarer Text nur aus `cira.terms.yaml`; „SYNTX“ bleibt gesperrt.
- Generierte Dateien nur über die Generatoren (E-10). Keine Ignore-Einträge (E-16), keine gelockerten Tests (E-09).
- Neue Zeichen (SEM-038) und Dekor (DEC-04…08) sind Registererweiterungen der Klasse F2 wie DEC-01–03 (ADR-0007).
- Alles, was Verträge, die G03.3-Matrix oder eingefrorene Bündel berühren würde, wird F3 → `docs/change-requests/`.

## Owner-Entscheidungen (eingefroren)
| OD | Entscheidung |
|---|---|
| OD-01 | keine chromatische Abschwächung (K1) |
| OD-02 | `surface.focus #141D27`, neues Zeichen SEM-038 „Mit Auswahl verknüpft“ |
| OD-03 | Nachweis über `make gate PHASE=05` auf dem Branch |
| OD-05/OD-11 | Korrekturen G3-14, G3-15, G3-29, G3-37 nur auf dem Branch |
| OD-06 | DEC-04 Emblem, DEC-05 Bögen, DEC-06 drei Emblemachsen, DEC-07 Vignette |
| OD-08 | Aufmerksamkeitsdämpfung (MOT19, R11 — ein Bit je Fokus-Zustand) |
| OD-09 | Emblemlicht DEC-08 und am Anker zentrierte Vignette |
| OD-10 | Tiefenschatten, vom Anker weg geworfen |
| OD-12 | Projektorkante `#546D86` |
| OD-13 | Q2-01, Q2-03–Q2-06 wie spezifiziert |
| OD-14 | Präsentationsskala `clamp(1, 1,25 × H/1080, 1,25)` |
| OD-15 | Kurzbühne 880 px, Schatten 0,55 / −6 px, gemeinsamer Atem von Emblem und Licht |
| OD-07 | Promotion nach `main` und neuer Film: offen (eigene Owner-Freigabe) |

## Einträge je Einheit
| Einheit | Datum | Inhalt | Nachweis |
|---|---|---|---|
| U00 | 2026-11-27 | Branch ab `ac5073b`, Architektur v2.0.3 abgelegt, ADR-Rahmen, NEXT/SESSION_LOG | `make verify` grün (Ausgangslage) |
| U01 | 2026-11-27 | Request- und Feld-Inventar je Sicht von `ac5073b` (`frontend/test/inventory/main-ac5073b.json`, geschrieben nur per `CIRA_WRITE_INVENTORY=1`, nie grün); Harness zeichnet API-Anfragen auf | V3T03/V2T01: 23 Tests grün |
| U02 | 2026-11-27 | Inspektionsläufe außerhalb von `verify`: `npm run inspect` (132er-Matrix 11 Sichten × 3 Viewports × EN/DE × 2 Modi), `npm run inspect:perf` (Frame-Intervalle, Long Tasks); Selbsttest der Matrix | Matrix-Selbsttest grün; Probelauf Sicht 01: 12 PNG |
| U03 | 2026-11-27 | `cira.semiontics.yaml` 1.1.0: abgeleitete Farben als Formeln (`derive`), Projektorprofil, Komponenten-, Dekor-, Kompositions- und Licht-Tokens, Bewegungs-Tokens, deklarierte Farbübergänge; Rundung abgeleiteter 8-bit-Werte: half to even | V3T01 |
| U04 | 2026-11-27 | Generator: `resolve()` (mix, lightest_on_path), `neuro_report()` (Fokusfläche, Pfadminima, Dekorbudgets, Grafik-Tinten, Projektorprofil), Ausgabe `--cmp-/--decor-/--comp-/--light-*`, Projektorblock, `COMPONENT/DECOR/COMP/LIGHT` in tokens.ts | V3T01: 10 Tests grün; Werte = Architektur (#141D27, #0B1922/#1A160E/#151424, #546D86) |
| U05 | 2026-11-27 | Rollenvariablen `--ink-1/2/3`, `--surface-block`, `--border-block`, `--tint-a/o/r` in `app.css`; Ruhewert = kanonischer Token; Ausnahmeset pinnt zurück | **CP1:** TX29 pixelgleich (11 Baselines unverändert), 517/517 grün |
