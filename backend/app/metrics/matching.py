"""GAP matcher subjects_tickwindow_1to1/v1 (07.4, S-01, K-47): node-level classes, TP = Σ min per class."""

from __future__ import annotations

from collections.abc import Mapping

from .views import CaseView, GapView


def normalize(subject_refs: tuple[str, ...], rule_applies_to: Mapping[str, tuple[str, ...]]) -> frozenset[str]:
    out: set[str] = set()
    for s in subject_refs:
        prefix, rest = s.split(":", 1)
        if prefix == "attr":
            out.add("node:" + rest.split("/", 1)[0])
        elif prefix == "node":
            out.add(s)
        elif prefix == "rule":
            out.update(rule_applies_to.get(s, ()))
        elif prefix == "obs":
            # obs:<src|none>:<n>/<a>:t<tick>
            out.add("node:" + rest.split(":", 1)[1].split("/", 1)[0])
        else:
            out.add(s)
    return frozenset(out)


Pair = tuple[str | None, str | None, str, tuple[str, ...]]


def match(cases: tuple[CaseView, ...], gaps: tuple[GapView, ...], tick: int
          ) -> tuple[int, int, int, list[Pair]]:
    active = [c for c in cases if c.active(tick)]
    at_t = [g for g in gaps if g.tick == tick]
    keys = sorted({c.nodes for c in active} | {g.nodes for g in at_t}, key=lambda k: tuple(sorted(k)))
    tp = fn = fp = 0
    pairs: list[Pair] = []
    for k in keys:
        cs = sorted((c for c in active if c.nodes == k), key=lambda c: c.case_id)
        gs = sorted((g for g in at_t if g.nodes == k), key=lambda g: g.gap_id)
        key = tuple(sorted(k))
        n = min(len(cs), len(gs))
        tp += n
        for i in range(n):
            pairs.append((cs[i].case_id, gs[i].gap_id, "TP", key))
        for c in cs[n:]:
            fn += 1
            pairs.append((c.case_id, None, "FN", key))
        for g in gs[n:]:
            fp += 1
            pairs.append((None, g.gap_id, "FP", key))
    return tp, fn, fp, pairs
