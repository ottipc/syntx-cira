# Integrierte Prüfung der Präsentationsarchitektur · Stand v2.1

Datum: 2026-11-27 · Grundlage: Kopplungsarchitektur v0.5 (FROZEN) mit Nachtrag N1, GUI-Architektur v2.0.3 mit Nachtrag F04 / ADR-0009
Werkzeug: `python3 presentation/coupling/v2.1/integrated_check.py` (Rohdaten: `integrated_check.json`)

## Ergebnis

**Bestanden.** Von 55 Prüfungen sind 54 erfüllt. Es gibt keinen harten Fehler. Offen ist ein weicher Anker (A6, unverändert seit v1).

| Block | Inhalt | Ergebnis |
|---|---|---|
| G | GUI `feature/semiontic-gui-v2` + Patch: `make verify` (Backend 247 Tests, Schemas, mypy, Import-Linter; Frontend 785 Tests inkl. V3T20, e2e, Kontrast; trace/operator/fixture lint, Ableitungsdiff) | grün |
| P1 | Fallback-Bestand: 12 Dateien (v1 vollständig, v2-Film und v2-Fassungen) sha256-gleich | 12/12 |
| P2 | Film v2.1: H.264 High, 1920 × 1080, 30/1 konstant, 2400 Frames, 80,000 s, kein Ton; Manifest bindet den Film (I2, I3, I8) | 3/3 |
| P3 | Manifest: 8 monotone Schrittereignisse, A1–A6 erfüllt, A5-Fenster in Schritt 6 | 3/3 |
| P4 | Timeline lückenlos 0–180 s, S04 = 80 s (I3) | 2/2 |
| P5 | MANUAL_v2 und AUTO_180s_v2: Video startet mit jeder Folie, Abspieldauer = Zustand; S04 bitgleich Film v2.1; übrige Clips bitgleich v1; Wechsel (MANUAL: S04 per Klick, I13; AUTO: alles Zeit, Klick gesperrt, Owner-Abweichung); Narration wortgleich (I1); kein „Illustrative“ (I4); A5-Hinweis = gemessenes Fenster | 16/16 |
| P6 | Sprachprobe v2.1: Sätze je Cue = Narration (358 Wörter), Wortlaut identisch mit der v1-Probe (I1) | 2/2 |
| P7 | Zeitlage: Sätze in 0–180 s ohne Überlappung, Zustände eingehalten, F1–F4 in S04; **A5a 121,20–123,32 s, A5b 123,67–127,80 s im Fenster 121,0–130,2 s (I10)**; A1–A4 in ihren Schritten | 9/10 (1 weich offen) |
| P8 | Sprachprobe-Video Bild und Ton je 180,000 s; MP3 180,048 s (Encoder-Auffüllung); vor 121,0 s Stille, in A5a Sprache | 3/3 |
| P9 | Probe-Video v2.1: 5400 Frames; S04 = Film v2.1, außerhalb = v1-Probe (Grauwertdifferenz ≤ 0,17) | 2/2 |
| P10 | Fallback-Fassungen tragen ihren eigenen Film (v1, v2) | 2/2 |
| L | LibreOffice-Import: MANUAL_v2 Zeitwechsel 10/25/35/–/20/– s; AUTO_180s_v2 10/25/35/80/20/– s | wie Timeline |

## Befunde

| Nr. | Art | Befund |
|---|---|---|
| B1 | weich | A6 „… remains with the people responsible“ fällt bei 143,06–145,96 s in Schritt 8 (Fenster Schritt 7: 130,4–140,3 s). In der v1-Probe lag der Satz bei 142,85 s, ebenfalls in Schritt 8. A6 ist weich (bevorzugt); Narration und Timeline bleiben unverändert. |
| B2 | Hinweis | Der hintere S04-Block der Sprachprobe beginnt jetzt bei 121,2 s (vorher 120,25 s) und läuft mit Tempo 1,237 statt 1,199 (≈ 3 % schneller). Er endet bei 148,89 s, die Gesamtdauer bleibt 180 s. |
| B3 | Hinweis | `…_Stimme_CLEAN.mp4` unterscheidet sich von `…_Stimme.mp4` gemessen nur durch eine neue AAC-Kodierung: Bildspur identisch (MD5), Ton höchstens ≈ 0,04 Abweichung, keine Abweichung in den letzten 10 s. Die Sprachprobe v2.1 ist direkt aus den Sprachsegmenten erzeugt. Eine eigene Korrektur am Ende ist nicht nachvollziehbar und wurde nicht übernommen. |
| B4 | Hinweis | Im Headless-Renderer der Neuaufnahme dauert die Ladephase je Schritt 0,2–0,5 s. Das A5-Fenster ist deshalb nach der stabilisierten Komposition vermessen (Frame 1530). |
| B5 | offen (Altstand) | Aus §10 von v0.5 fehlen im Repo weiterhin `s04.binding.json`, `timeline.json` v1.0.2 (die Bühne nutzt v1.0.1), die Istmessung auf dem Abspielrechner (Schritt 6) und der Austausch-Test mit einem Dummy-Film (Schritt 8). Die Bindung tragen derzeit `film.manifest.json` (Hash, Anker) und diese Prüfung. Am Stand hat sich durch v2.1 nichts geändert. |

## Versionen (sha256, Präfix)

| Artefakt | sha256 |
|---|---|
| `video/CIRA_Product_Film_80s_semiotic_v2.1.mp4` | 53e75f4312b4466b |
| `presentation/CIRA_EDTH2026_MANUAL_v2.pptx` | cb02247dabfa792e |
| `presentation/CIRA_EDTH2026_AUTO_180s_v2.pptx` | 062ecc73a6b072ac |
| `presentation/CIRA_EDTH2026_Probe_180s_v2.1.mp4` | 8e94b4c7c779da73 |
| `presentation/CIRA_EDTH2026_Probe_180s_Stimme_v2.1.mp4` | a94d41d80a144efe |
| `presentation/CIRA_EDTH2026_Sprechtext_180s_v2.1.mp3` | e81278cd2b04bd9d |
| `presentation/voice_timing_v2.1.json` | 9c722e496c693d6d |
| `presentation/coupling/config/timeline.json` (v1.0.1) | e9607f5d4de8c2e2 |
| `presentation/coupling/config/narration.json` | 387f5409afd4e075 |

Fallback-Ordnung und Relationen: Nachtrag N1, §1 und §3.
