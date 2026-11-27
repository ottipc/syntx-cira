#!/usr/bin/env python3
"""K1 Filmfeld — vermisst den Produktfilm und schreibt film.manifest.json + 8 Schritt-Standbilder.

Architektur: docs/architecture/SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md (Schritt 1).
Nur lesend gegenüber dem Film. Benötigt ffmpeg/ffprobe und numpy.
Aufruf (aus dem Repo-Root): python3 presentation/coupling/measure_film.py
"""
import csv, hashlib, io, json, subprocess, sys
from fractions import Fraction
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
FILM = ROOT / 'video' / 'CIRA_Product_Film_80s.mp4'
OUT = Path(__file__).resolve().parent
STEPS = 8
STEP_S = 10            # nominale Schrittdauer laut demo.steps.json
S04_START = 70.0       # kanonischer Filmstart auf der Bühne (timeline.json)
DIFF_THRESHOLD = 1.0   # mittlere Grauwertdifferenz (0–255) auf 160×90, ab der ein Frame als Schrittwechsel zählt
CLUSTER_GAP = 15       # Frames: Änderungen mit kleinerem Abstand gehören zu einem Wechsel
STILL_OFFSET_S = 5     # Standbild 5 s nach Schrittbeginn


def run(*a):
    return subprocess.run(a, check=True, capture_output=True, text=True).stdout


def sha256(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def main():
    probe = json.loads(run('ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(FILM)))
    streams = probe['streams']
    v = next(s for s in streams if s['codec_type'] == 'video')
    audio = [s for s in streams if s['codec_type'] == 'audio']
    tb = Fraction(v['time_base'])
    fps = Fraction(v['r_frame_rate'])

    rows = list(csv.reader(io.StringIO(run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                           'frame=key_frame,pts,duration', '-of', 'csv=p=0', str(FILM)))))
    key = [int(r[0]) for r in rows]
    pts = [int(r[1]) for r in rows]
    dur = [int(r[2]) for r in rows]
    n = len(pts)
    deltas = sorted({pts[i + 1] - pts[i] for i in range(n - 1)})
    d_m = (pts[-1] + dur[-1] - pts[0]) * tb
    frame_dur = Fraction(dur[0]) * tb

    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(FILM), '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'],
                         check=True, capture_output=True).stdout
    g = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 90, 160).astype(np.float32)
    diff = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
    changed = [i + 1 for i, x in enumerate(diff) if x > DIFF_THRESHOLD]
    clusters = []
    for f in changed:
        if clusters and f - clusters[-1][-1] <= CLUSTER_GAP:
            clusters[-1].append(f)
        else:
            clusters.append([f])

    def sec(frame):
        return float(pts[frame] * tb)

    events = [{'step': 1, 'onset_frame': 0, 'settle_frame': 0}]
    for k, c in enumerate(clusters, start=2):
        events.append({'step': k, 'onset_frame': c[0], 'settle_frame': c[-1]})
    ok_steps = len(events) == STEPS
    for i, e in enumerate(events):
        end = events[i + 1]['onset_frame'] if i + 1 < len(events) else n
        e.update({
            'nominal_start_s': (e['step'] - 1) * STEP_S,
            'onset_s': round(sec(e['onset_frame']), 4),
            'settle_s': round(sec(e['settle_frame']), 4),
            'visible_window_film_s': [round(sec(e['settle_frame']), 4), round(float(end * frame_dur), 4)],
            'visible_window_stage_s': [round(S04_START + sec(e['settle_frame']), 4), round(S04_START + float(end * frame_dur), 4)],
            'onset_offset_frames': e['onset_frame'] - round((e['step'] - 1) * STEP_S * fps),
        })

    stills = []
    (OUT / 'stills').mkdir(exist_ok=True)
    for e in events:
        f = e['onset_frame'] + int(STILL_OFFSET_S * fps)
        p = OUT / 'stills' / f'step_{e["step"]}.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(FILM), '-vf', f'select=eq(n\\,{f})', '-frames:v', '1', str(p)], check=True)
        stills.append({'step': e['step'], 'frame': f, 'film_s': round(sec(f), 4), 'file': f'stills/{p.name}', 'sha256': sha256(p)})

    keyframes = [i for i, k in enumerate(key) if k == 1]
    boundary_frames = [round(t * fps) for t in (20, 40, 60)]
    manifest = {
        'artifact': 'film.manifest.json',
        'field': 'K1 Filmfeld',
        'architecture': 'SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md',
        'film': {
            'path': 'video/CIRA_Product_Film_80s.mp4', 'sha256': sha256(FILM), 'bytes': FILM.stat().st_size,
            'commit': 'ac5073b', 'origin': 'FIXTURE', 'origin_term': 'origin.fixture — Test fixture — not an engine result',
            'recorded_with': 'Play demo (frontend/src/demo/demo.steps.json, 8 × 10 s)',
        },
        'stream': {
            'codec': v['codec_name'], 'profile': v.get('profile'), 'pix_fmt': v.get('pix_fmt'),
            'width': v['width'], 'height': v['height'], 'aspect': '16:9' if v['width'] * 9 == v['height'] * 16 else 'other',
            'fps': f'{fps.numerator}/{fps.denominator}', 'constant_frame_rate': len(deltas) == 1,
            'time_base': f'{tb.numerator}/{tb.denominator}', 'audio_streams': len(audio),
        },
        'timing': {
            'frames': n, 'first_pts': pts[0], 'last_pts': pts[-1], 'frame_duration_s': float(frame_dur),
            'media_duration_s_from_pts': float(d_m), 'container_duration_s': float(probe['format']['duration']),
            'canonical_s04_s': 80.0, 'delta_s': float(d_m - 80), 'delta_frames': float((d_m - 80) / frame_dur),
            'delta_within_one_frame': abs(d_m - 80) <= frame_dur,
        },
        'keyframes': {
            'frames': keyframes, 'seconds': [round(sec(i), 4) for i in keyframes],
            'keyframes_at_20_40_60': all(b in keyframes for b in boundary_frames),
            'note': 'Stufe B (verlustfreie Teilung ohne Neukodierung) setzt Keyframes bei 20/40/60 s voraus.',
        },
        'step_detection': {'method': 'mittlere absolute Grauwertdifferenz aufeinanderfolgender Frames, 160×90',
                           'threshold': DIFF_THRESHOLD, 'cluster_gap_frames': CLUSTER_GAP, 'steps_found': len(events),
                           'steps_expected': STEPS, 'ok': ok_steps},
        'step_events': events,
        'stills': stills,
        'identity_class': {'html_stage': 'bitgleich (Stufe A)', 'pptx_fallback': 'bitgleich (Stufe A, ein Video auf S04)'},
    }
    (OUT / 'film.manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({k: manifest[k] for k in ('timing', 'step_detection')}, indent=2, ensure_ascii=False))
    if not (ok_steps and manifest['timing']['delta_within_one_frame']):
        sys.exit('Messung verletzt I3/Schrittstruktur — siehe Manifest')


if __name__ == '__main__':
    main()
