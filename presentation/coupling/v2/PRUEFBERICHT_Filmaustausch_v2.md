# Prüfbericht Filmaustausch v1 → semiotic v2

> **Ablage seit v2.1 (2026-11-27):** Film v2 und die Fassungen mit v2-Film sind Fallback. Die Decks liegen unter `presentation/fallback/semiotic_v2_A5_verletzt/`, gültig ist v2.1 (`presentation/coupling/v2.1/`).

Grundlage: `docs/architecture/SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md`, Abschnitt 11 (Austauschbarkeit). Datum: 2026-11-27.

## 1. Film (K1)

| Größe | v1 (ac5073b) | semiotic v2 |
|---|---|---|
| Datei | `video/CIRA_Product_Film_80s.mp4` | `video/CIRA_Product_Film_80s_semiotic_v2.mp4` |
| sha256 | d16ffa72…ea31 | 9ad2e006…7d64 |
| Codec / Auflösung | H.264 High, 1920 × 1080 | H.264 High, 1920 × 1080 |
| Bildrate / Frames | 30/1 konstant, 2400 | 30/1 konstant, 2400 |
| Dauer aus PTS | 80,000 s (Δ 0) | 80,000 s (Δ 0) |
| Ton | keiner | keiner |
| Schritte gefunden | 8 | 8 |
| Herkunft | FIXTURE | FIXTURE (Badge sichtbar) |

Schrittstruktur und Dauer sind gleich → Narration und Timeline bleiben unverändert (Abschnitt 11).

## 2. Schritt-Ereignisse v2 (G1)

| Schritt | Ansicht | Beginn (Frame) | steht ab (Frame) | Fenster Bühne |
|---|---|---|---|---|
| 1 | Systemübersicht | 0 | 0 | 70,000–79,933 s |
| 2 | Zustandsvergleich t = 2 | 298 | 299 | 79,967–89,933 s |
| 3 | Zustandsvergleich, Filter OPEN | 598 | 598 | 89,933–99,967 s |
| 4 | Zustandsvergleich, Fokus n08 | 899 | 902 | 100,067–110,033 s |
| 5 | Vorwärtsrekonstruktion | 1201 | 1201 | 110,033–120,033 s |
| 6 | Metriken | 1501 | 1508 | 120,267–130,133 s |
| 7 | Szenariovergleich | 1804 | 1807 | 130,233–140,133 s |
| 8 | Systemübersicht t = 5 | 2104 | 2104 | 140,133–150,000 s |

## 3. Ankerprüfung (G2)

| Anker | Ergebnis |
|---|---|
| A1 Herkunftssatz | erfüllt |
| A2 „On the left is Ground Truth“ | erfüllt |
| A3 „combined result in violet“ | erfüllt |
| A4 „Some values may remain unknown“ | erfüllt (n09 offen in Schritt 5) |
| **A5a/A5b „Coverage …“, „Accuracy …“** | **verletzt**: Die Metrikansicht zeigt während des ganzen Schritts 6 nur die Gruppe REFERENCE STATE · Ω_A (M02, M03, M04). M05 Coverage und M11 Accuracy sind nicht im Bild; zwischen Frame 1508 und 1803 gibt es keine Bewegung. |
| A6 „remains with the people responsible“ | erfüllt |

Im v1-Film waren M05 und M11 in Schritt 6 sichtbar. Die Abweichung liegt im Bildausschnitt der neuen Metrikansicht, nicht in der Präsentation.

## 4. PowerPoint-Fassungen

| Datei | Folien | S04 | Wechsel | Gesamt | statische Prüfung | LibreOffice-Import |
|---|---|---|---|---|---|---|
| `CIRA_EDTH2026_MANUAL_v2.pptx` | 6 | v2-Film bitgleich | S04 per Klick, sonst Zeit | 180,000 s | bestanden | 4 Zeitwechsel, 6 Autoplay |
| `CIRA_EDTH2026_AUTO_180s_v2.pptx` | 6 | v2-Film bitgleich | alles Zeit, Klick gesperrt | 180,000 s | bestanden | 5 Zeitwechsel, 6 Autoplay |

Beide Dateien bestehen die Schema-Validierung. MANUAL_v2 enthält gegenüber MANUAL die LibreOffice-Korrektur (expliziter Schnitt bei den Zeitwechseln, Klick bleibt erlaubt). Die Fassungen mit v1-Film bleiben unverändert im Repo.

## 5. Offene Owner-Entscheidung

Die Präsentation ist mit dem v2-Film technisch fertig. Wegen A5 ist das Binding nach Architektur v0.5 (I10) aber nicht gültig. Wege:

1. **Demo-Schritt 6 neu aufnehmen** (z. B. Metrikansicht auf die Gruppe RECONSTRUCTION scrollen oder M05/M11 fokussieren) — stellt I10 wieder her, ohne Text- oder Präsentationsänderung.
2. **v2-Film so verwenden** — als bewusste Owner-Abweichung von I10 dokumentieren; „Coverage“ und „Accuracy“ werden gesprochen, während Referenz-Metriken zu sehen sind.
3. **Bei v1 bleiben**, bis Weg 1 umgesetzt ist.
