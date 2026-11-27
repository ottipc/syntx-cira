# Messbericht Schritt 1 — K1 Filmfeld

Architektur: `docs/architecture/SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md`, Abschnitt 10, Schritt 1.
Reproduzierbar mit `python3 presentation/coupling/measure_film.py` (aus dem Repo-Root). Ergebnis: `film.manifest.json`, `stills/step_1–8.png`.

## Film

| Größe | Wert |
|---|---|
| Datei | `video/CIRA_Product_Film_80s.mp4` (Commit ac5073b) |
| sha256 | `d16ffa72476b3352bf299c55bafab99ce669c953861eade26a5c185afba8ea31` |
| Größe | 2 149 836 Bytes |
| Codec | H.264 High, yuv420p |
| Auflösung | 1920 × 1080, 16:9 (passt ohne Rand auf die 16:9-Bühne) |
| Bildrate | 30/1, konstant (alle PTS-Abstände 512 bei Zeitbasis 1/15360) |
| Tonspur | keine |
| Frames | 2400 |
| Herkunft | FIXTURE |

## Dauer (I3, I11)

| Größe | Wert |
|---|---|
| Mediendauer aus PTS | 80,000 s |
| Container-Dauer | 80,000 s |
| Δ gegen kanonisch 80,000 s | **0 Frames** → I3 erfüllt |
| Erster Frame | vollständig gerendert (Systemübersicht, t = 0/5) — kein Ladezustand, tauglich als Poster |

## Keyframes

0 · 8,333 · 16,667 · 25,0 · 33,333 · 40,167 · 48,5 · 56,833 · 65,167 · 73,5 s.
Keine Keyframes bei 20/40/60 s → Stufe B wäre ohne Neukodierung nicht möglich. Für die gewählte Stufe A ohne Bedeutung.

## Schritt-Ereignisse (G1)

Gemessen als Bildwechsel (Schwelle 1,0 auf 160 × 90 Graustufen). Zwischen den Wechseln ist der Film statisch (nur Kodierrauschen ≤ 0,1 an Keyframes).

| Schritt | Ansicht | Beginn (Frame / Film-s) | steht ab (Frame) | Sichtbarkeitsfenster Bühne | Versatz zum Nominalwert |
|---|---|---|---|---|---|
| 1 | Systemübersicht t = 0 | 0 / 0,000 | 0 | 70,000–80,000 s | 0 |
| 2 | Zustandsvergleich t = 2 | 300 / 10,000 | 308 | 80,267–90,033 s | 0 |
| 3 | Zustandsvergleich, Filter OPEN | 601 / 20,033 | 605 | 90,167–100,033 s | +1 Frame |
| 4 | Zustandsvergleich, Fokus n08 | 901 / 30,033 | 901 | 100,033–110,033 s | +1 Frame |
| 5 | Vorwärtsrekonstruktion | 1201 / 40,033 | 1205 | 110,167–120,033 s | +1 Frame |
| 6 | Metriken | 1501 / 50,033 | 1503 | **120,100–130,067 s** | +1 Frame |
| 7 | Szenariovergleich | 1802 / 60,067 | 1803 | 130,100–140,133 s | +2 Frames |
| 8 | Systemübersicht t = 5 | 2104 / 70,133 | 2105 | 140,167–150,000 s | +4 Frames |

Alle 8 Schritte gefunden. Die Schrittwechsel liegen 0–4 Frames (≤ 0,133 s) nach dem Nominalwert; das ist eine Eigenschaft der Aufnahme und wird über das Manifest aufgelöst, nicht korrigiert.

## Folgen für die nächsten Schritte

- **Harter Anker A5 (I10):** Das gemessene Fenster für „Coverage …“ und „Accuracy …“ ist **120,100–130,067 s** Bühnenzeit (9,967 s). 18 Wörter bei 2,45 W/s ≈ 7,3 s passen hinein.
- **Engstelle E6 bestätigt:** Ab 120,100 s bis 149,0 s bleiben 28,9 s für 72 Wörter (≈ 2,49 W/s ohne Pausen).
- **Fallback STILLS:** 8 Standbilder je 5 s nach Schrittbeginn, mit sha256 im Manifest.

## Nächster Schritt

Schritt 2 ist der gesprochene Probedurchlauf durch OB: F1–F4 zum laufenden Film sprechen und aufnehmen. Danach werden die Wort-Zeitstempel gegen die Fenster oben gelegt, getrennt nach den Tempozonen 70–120 s und 120–149 s.
