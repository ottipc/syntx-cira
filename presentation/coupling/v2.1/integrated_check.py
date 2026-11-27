#!/usr/bin/env python3
"""Integrierte Prüfung der Präsentationsarchitektur (Kopplung Film ↔ Präsentation v0.5, Stand v2.1).

Aufruf aus dem Repo-Wurzelverzeichnis:  python3 presentation/coupling/v2.1/integrated_check.py
Benötigt ffmpeg/ffprobe und numpy. Schreibt integrated_check.json neben dieses Skript und endet mit 1,
sobald eine harte Prüfung fehlschlägt. Weiche Anker werden berichtet, nicht gewertet.
"""
import hashlib, json, re, subprocess, sys, zipfile
from html import unescape
from pathlib import Path

import numpy as np

ROOT = Path.cwd()
HERE = Path(__file__).resolve().parent
P = ROOT / "presentation"
CFG = P / "coupling" / "config"
FILM = ROOT / "video/CIRA_Product_Film_80s_semiotic_v2.1.mp4"
MAN = json.loads((HERE / "film.manifest.json").read_text())
TL = json.loads((CFG / "timeline.json").read_text())
NAR = json.loads((CFG / "narration.json").read_text())
VT = json.loads((P / "voice_timing_v2.1.json").read_text())
VT1 = json.loads((P / "voice_timing.json").read_text())

# Fallback-Bestand: Inhalt darf sich nie ändern (v1 = origin/main 95eab3b; v2 = Film semiotic v2, A5 verletzt)
FALLBACK = {
    "video/CIRA_Product_Film_80s.mp4": "d16ffa72476b3352bf299c55bafab99ce669c953861eade26a5c185afba8ea31",
    "presentation/CIRA_EDTH2026_MANUAL.pptx": "dd104a555355f88d08358b4a52e43a5d33b61a0ac2fc9f0ebc308566f9bea219",
    "presentation/CIRA_EDTH2026_AUTO_180s.pptx": "a917c38f4b54139047ede4d73480c780a90a645717451b60d5f669314e83ad68",
    "presentation/CIRA_EDTH2026_Probe_180s.mp4": "979ee49f65a15d585a438f67fe855bf5557ec0f0ca0cd892e6a5e09a3235a4df",
    "presentation/CIRA_EDTH2026_Probe_180s_Stimme.mp4": "0d246a6b4692762e45419c69994a6bcb63de511c6f1b2a5011ed0b7c6ae63d3a",
    "presentation/CIRA_EDTH2026_Probe_180s_Stimme_CLEAN.mp4": "ea77b3861e6aadb18620461f64f6c45923aca4128526314d61a48d485934d124",
    "presentation/CIRA_EDTH2026_Sprechtext_180s.mp3": "57ea2e51f56efaf3db3f005ec16cde14b747c73aeabb843655af00653b859943",
    "presentation/voice_timing.json": "351b47c8dd111b73470b3d087f573944e98c1e5158dc7a861c54b663da0f11df",
    "presentation/coupling/film.manifest.json": "f99f110b774cc49376dba41b990c06cbd93f00b80e5af202ae8b222ff0d838ff",
    "video/CIRA_Product_Film_80s_semiotic_v2.mp4": "9ad2e0067678e1b090a09514dc147a7685773310618efcf9096b8c80df1c7d64",
    "presentation/fallback/semiotic_v2_A5_verletzt/CIRA_EDTH2026_MANUAL_v2.pptx": "5167ec88567b5b9d17bfe18b3bf143bc9ec3e4948c91e410cfa1fecc72430e3a",
    "presentation/fallback/semiotic_v2_A5_verletzt/CIRA_EDTH2026_AUTO_180s_v2.pptx": "2c7ec85d6abc8864dfe441952e8f6b1b27f89470e685708b5fa7560e7d4aad18",
}

results: list[dict] = []
def check(pid, name, ok, detail="", hard=True):
    results.append({"id": pid, "check": name, "ok": bool(ok), "hard": hard, "detail": detail})

sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
def probe(path, entries):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", entries, "-of", "json", str(path)], capture_output=True, text=True, check=True).stdout
    return json.loads(out)
def gray(path, t, w=320, h=180):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", str(path), "-frames:v", "1", "-vf", f"scale={w}:{h},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).astype(int)
def pcm(path, sr=8000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)
def fixture(text):
    r = NAR["originReplacement"]; return text.replace(r["sentence"], r["byOrigin"]["fixture"])

# P1 — Fallback-Bestand unverändert
for rel, h in FALLBACK.items():
    f = ROOT / rel
    check("P1", f"Fallback {rel}", f.exists() and sha(f) == h, "sha256 gleich" if f.exists() else "fehlt")

# P2 — Film v2.1 (I2, I3, I8)
s = probe(FILM, "stream=codec_type,codec_name,profile,width,height,r_frame_rate,avg_frame_rate,nb_frames,pix_fmt,duration")["streams"]
v = [x for x in s if x["codec_type"] == "video"]; a = [x for x in s if x["codec_type"] == "audio"]
check("P2", "Film: H.264 High 1920×1080 yuv420p", len(v) == 1 and v[0]["codec_name"] == "h264" and v[0]["profile"] == "High"
      and (v[0]["width"], v[0]["height"]) == (1920, 1080) and v[0]["pix_fmt"] == "yuv420p")
check("P2", "Film: 30/1 konstant, 2400 Frames, 80,000 s, kein Ton (I3)", v[0]["r_frame_rate"] == v[0]["avg_frame_rate"] == "30/1"
      and int(v[0]["nb_frames"]) == 2400 and abs(float(v[0]["duration"]) - 80.0) < 1 / 30 and not a, f'{v[0]["nb_frames"]} Frames, {v[0]["duration"]} s')
check("P2", "Manifest bindet den Film (sha256, I8)", MAN["film"]["sha256"] == sha(FILM), MAN["film"]["sha256"][:16])

# P3 — Manifest: Schrittereignisse und Anker (G1, G2)
ev = MAN["step_events"]
check("P3", "8 Schrittereignisse, monoton", len(ev) == 8 and all(ev[i]["onset_frame"] < ev[i + 1]["onset_frame"] for i in range(7)))
check("P3", "Ankerprüfung A1–A6 erfüllt", all(x["result"] == "erfüllt" for x in MAN["anchor_check"].values()),
      ", ".join(f"{k}: {x['result']}" for k, x in MAN["anchor_check"].items()))
A5W = MAN["anchor_check"]["A5a/A5b"]["window_stage_s"]
st6 = next(e for e in ev if e["step"] == 6)
check("P3", "A5-Fenster liegt in Schritt 6", st6["visible_window_stage_s"][0] <= A5W[0] < A5W[1] <= st6["visible_window_stage_s"][1] + 1e-6, f"{A5W[0]}–{A5W[1]} s")

# P4 — Timeline (I3)
states = TL["states"]
check("P4", "Zustände lückenlos 0–180 000 ms", states[0]["startMs"] == 0 and states[-1]["endMs"] == 180000 == TL["durationMs"]
      and all(states[i]["endMs"] == states[i + 1]["startMs"] for i in range(len(states) - 1)))
s04 = next(x for x in states if x["id"] == "S04")
check("P4", "S04 = Filmdauer 80 s", s04["endMs"] - s04["startMs"] == 80000)

# P5 — PowerPoint-Fassungen (I1, I2, I4, I13 bzw. Owner-Abweichung AUTO)
def deck(path):
    z = zipfile.ZipFile(path); out = []
    for i in range(1, 7):
        rels = z.read(f"ppt/slides/_rels/slide{i}.xml.rels").decode()
        media = re.search(r'Target="\.\./media/([^"]+\.mp4)"', rels).group(1)
        xml = z.read(f"ppt/slides/slide{i}.xml").decode()
        tr = re.search(r"<p:transition[^>]*/?>", xml).group(0)
        notes = unescape(" ".join(re.findall(r"<a:t>([^<]*)</a:t>", z.read(f"ppt/notesSlides/notesSlide{i}.xml").decode())))
        out.append({"media": hashlib.sha256(z.read("ppt/media/" + media)).hexdigest(), "tr": tr, "notes": notes,
                    "autoplay": 'evt="onBegin"' in xml and 'cmd="playFrom(0.0)"' in xml,
                    "play_ms": int(m.group(1)) if (m := re.search(r'playFrom\(0\.0\)"><p:cBhvr><p:cTn id="\d+" dur="(\d+)"', xml)) else None})
    return out
film_sha = sha(FILM); v1 = deck(P / "CIRA_EDTH2026_MANUAL.pptx")
cue_of = {c["stateId"]: c["id"] for c in TL["cues"] if c["stateId"] != "S04"}
for name, mode in [("CIRA_EDTH2026_MANUAL_v2.pptx", "manual"), ("CIRA_EDTH2026_AUTO_180s_v2.pptx", "auto")]:
    d = deck(P / name); tag = name.replace("CIRA_EDTH2026_", "").replace(".pptx", "")
    dur = [st["endMs"] - st["startMs"] for st in states]
    check("P5", f"{tag}: 6 Folien, Video startet mit der Folie, Abspieldauer = Zustand", len(d) == 6 and all(x["autoplay"] for x in d)
          and [x["play_ms"] for x in d] == dur, str([x["play_ms"] for x in d]))
    check("P5", f"{tag}: S04-Medium bitgleich Film v2.1 (I2)", d[3]["media"] == film_sha)
    check("P5", f"{tag}: S01–S03, S05, S06 bitgleich mit v1", all(d[i]["media"] == v1[i]["media"] for i in (0, 1, 2, 4, 5)))
    adv = [int(m.group(1)) if (m := re.search(r'advTm="(\d+)"', x["tr"])) else None for x in d]
    if mode == "manual":
        ok = adv == [dur[0], dur[1], dur[2], None, dur[4], None]
        check("P5", f"{tag}: S04 ohne Zeitwechsel (I13), sonst Zeit = Timeline", ok, str(adv))
    else:
        ok = adv[:5] == dur[:5] and adv[5] is None and all('advClick="0"' in x["tr"] for x in d[:5])
        check("P5", f"{tag}: alle Wechsel nach Zeit, Klick gesperrt (Owner-Abweichung von I13), Σ = 180 s", ok and sum(dur) == 180000, str(adv))
    texts = [fixture(NAR["cues"][cue_of[st["id"]]]) for st in states if st["id"] != "S04"]
    others = [x["notes"] for i, x in enumerate(d) if i != 3]
    check("P5", f"{tag}: Narration S01–S03, S05, S06 wortgleich in den Notizen (I1)", all(t in n for t, n in zip(texts, others)))
    check("P5", f"{tag}: Narration F1–F4 wortgleich in S04 (I1, F1 = fixture)", all(fixture(NAR["cues"][f]) in d[3]["notes"] for f in ("F1", "F2", "F3", "F4")))
    check("P5", f"{tag}: kein „Illustrative“ in S04 (I4)", "illustrat" not in d[3]["notes"].lower())
    fm = lambda x: f"{int(x // 60)}:{x % 60:04.1f}".replace(".", ",")
    check("P5", f"{tag}: A5-Hinweis = gemessenes Fenster", f"{fm(A5W[0])}–{fm(A5W[1])}" in d[3]["notes"], f"{fm(A5W[0])}–{fm(A5W[1])}")

# P6 — Wortlaut der Sprachprobe (I1)
sent = VT["sentences"]
by_cue = {}
for x in sent: by_cue.setdefault(x["cue"], []).append(x["text"])
check("P6", "Sprachprobe v2.1: Sätze je Cue = Narration (fixture)", all(" ".join(by_cue[c]) == fixture(NAR["cues"][c]) for c in NAR["cues"]),
      f"{sum(len(t.split()) for t in (x['text'] for x in sent))} Wörter")
check("P6", "Sprachprobe v2.1: Wortlaut identisch mit v1-Probe", [x["text"] for x in sent] == [x["text"] for x in VT1["sentences"]])

# P7 — Zeitlage der Sprachprobe
check("P7", "Sätze in 0–180 s, ohne Überlappung", all(0 <= x["start"] < x["end"] <= 180 for x in sent)
      and all(sent[i]["end"] <= sent[i + 1]["start"] for i in range(len(sent) - 1)))
win = {c["id"]: (c["startMs"] / 1000, c["endMs"] / 1000) for c in TL["cues"]}
check("P7", "S01–S03, S05, S06 im eigenen Zustand", all(win[x["cue"]][0] <= x["start"] and x["end"] <= win[x["cue"]][1] for x in sent if x["cue"] in cue_of.values()))
check("P7", "F1–F4 innerhalb S04 (70–150 s)", all(70 <= x["start"] and x["end"] <= 150 for x in sent if x["cue"].startswith("F")))
a5 = [x for x in sent if x["text"].startswith(("Coverage", "Accuracy"))]
check("P7", "A5a und A5b satzvollständig im A5-Fenster (I10, hart)", len(a5) == 2 and all(A5W[0] <= x["start"] and x["end"] <= A5W[1] for x in a5),
      "; ".join(f"{x['start']:.2f}–{x['end']:.2f} s" for x in a5))
stage = {e["step"]: e["visible_window_stage_s"] for e in ev}
soft = [("A1", "This recording shows", (1, 8)), ("A2", "On the left is Ground Truth", (1, 2)), ("A3", "combined result in violet", (2, 4)),
        ("A4", "Some values may remain unknown", (3, 5)), ("A4", "CIRA keeps those visible", (3, 5)), ("A6", "remains with the people responsible", (7, 7))]
for aid, frag, (s0, s1) in soft:
    x = next(y for y in sent if frag in y["text"]); lo, hi = stage[s0][0], stage[s1][1]
    check("P7", f"{aid} „{frag} …“ in Schritt {s0}{'–' + str(s1) if s1 != s0 else ''} (weich)", lo <= x["start"] and x["end"] <= hi,
          f"{x['start']:.2f}–{x['end']:.2f} s, Fenster {lo:.2f}–{hi:.2f} s", hard=False)

# P8 — Audiodateien und Stille vor A5
stv = P / "CIRA_EDTH2026_Probe_180s_Stimme_v2.1.mp4"
ss = probe(stv, "stream=codec_type,duration")["streams"]
check("P8", "Sprachprobe-Video: Bild und Ton je 180,000 s", sorted(x["codec_type"] for x in ss) == ["audio", "video"] and all(abs(float(x["duration"]) - 180) < 0.02 for x in ss))
mp3 = probe(P / "CIRA_EDTH2026_Sprechtext_180s_v2.1.mp3", "format=duration")["format"]
check("P8", "Sprechtext-MP3: 180 s (+ Encoder-Auffüllung ≤ 0,06 s)", 0 <= float(mp3["duration"]) - 180 <= 0.06, mp3["duration"])
au = pcm(stv); rms = lambda t0, t1: float(np.sqrt(np.mean(au[int(t0 * 8000):int(t1 * 8000)] ** 2)))
pre, on = rms(119.6, A5W[0]), rms(a5[0]["start"], a5[0]["end"])
check("P8", "Tonspur: still zwischen A4 und Fensterbeginn, Sprache in A5a", pre < 0.01 * on + 1e-4 and on > 0.02, f"RMS {pre:.5f} vor 121,0 s · {on:.3f} in A5a")

# P9 — Probe-Video v2.1
pv = P / "CIRA_EDTH2026_Probe_180s_v2.1.mp4"
vs = probe(pv, "stream=nb_frames,r_frame_rate,duration")["streams"][0]
check("P9", "Probe-Video: 5400 Frames, 30/1, 180 s", int(vs["nb_frames"]) == 5400 and vs["r_frame_rate"] == "30/1")
d_in = max(np.abs(gray(pv, t) - gray(FILM, t - 70)).mean() for t in (70.05, 95, 121.5, 135, 149.9))
d_out = max(np.abs(gray(pv, t) - gray(P / "CIRA_EDTH2026_Probe_180s.mp4", t)).mean() for t in (1, 20, 50, 69.9, 155, 179.9))
check("P9", "S04 im Probe-Video = Film v2.1; außerhalb = v1-Probe", d_in < 0.5 and d_out < 0.5, f"max. Grauwertdifferenz {d_in:.3f} / {d_out:.3f}")

# P10 — Fallback-Fassungen konsistent
check("P10", "v1-Fassungen tragen den v1-Film", v1[3]["media"] == FALLBACK["video/CIRA_Product_Film_80s.mp4"])
v2d = deck(P / "fallback/semiotic_v2_A5_verletzt/CIRA_EDTH2026_MANUAL_v2.pptx")
check("P10", "v2-Fallback-Fassung trägt den v2-Film", v2d[3]["media"] == FALLBACK["video/CIRA_Product_Film_80s_semiotic_v2.mp4"])

hard_fail = [r for r in results if r["hard"] and not r["ok"]]
(HERE / "integrated_check.json").write_text(json.dumps({"results": results, "hard_failures": len(hard_fail)}, indent=1, ensure_ascii=False))
for r in results:
    print(f"{'OK ' if r['ok'] else ('FAIL' if r['hard'] else 'weich')} {r['id']:<4} {r['check']}" + (f" — {r['detail']}" if r["detail"] else ""))
print(f"\n{sum(r['ok'] for r in results)}/{len(results)} erfüllt, harte Fehler: {len(hard_fail)}")
sys.exit(1 if hard_fail else 0)
