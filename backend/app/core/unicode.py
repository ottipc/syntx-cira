"""Canonical code points for Σ identities and engine operator symbols (Kap. 03.5, K-31)."""

from __future__ import annotations

import re
import unicodedata

SIGMA = "Σ"  # GREEK CAPITAL LETTER SIGMA

# The 13 canonical operator symbols of registry v1.8.1 (K-29), with their exact code points.
CANONICAL_SYMBOLS: dict[str, int] = {
    ">": 0x003E,
    "<": 0x003C,
    "≈": 0x2248,  # ≈ ALMOST EQUAL TO
    "→": 0x2192,  # → RIGHTWARDS ARROW
    "↔": 0x2194,  # ↔ LEFT RIGHT ARROW
    "⊕": 0x2295,  # ⊕ CIRCLED PLUS
    "⊖": 0x2296,  # ⊖ CIRCLED MINUS
    "⊗": 0x2297,  # ⊗ CIRCLED TIMES
    "⊘": 0x2298,  # ⊘ CIRCLED DIVISION SLASH
    "∆": 0x2206,  # ∆ INCREMENT
    "∇": 0x2207,  # ∇ NABLA
    "∑": 0x2211,  # ∑ N-ARY SUMMATION
    "∂": 0x2202,  # ∂ PARTIAL DIFFERENTIAL
}

# Look-alikes that must be rejected rather than silently converted (Kap. 03.5).
CONFUSABLES: dict[str, str] = {
    "∑": "Σ",  # ∑ used as Σ
    "Ʃ": "Σ",  # Ʃ LATIN CAPITAL LETTER ESH used as Σ
    "＞": ">",
    "›": ">",
    "＜": "<",
    "‹": "<",
    "∼": "≈",
    "≃": "≈",
    "⇒": "→",
    "⟶": "→",
    "⇔": "↔",
    "⟷": "↔",
    "Δ": "∆",  # Δ GREEK CAPITAL LETTER DELTA used as ∆
    "Σ": "∑",  # Σ used as ∑ (only relevant in symbol position)
}

SIGMA_ID_V181 = re.compile("^" + SIGMA + r"(0[1-9]|[12][0-9]|30)$")


def nfc(text: str) -> str:
    return unicodedata.normalize("NFC", text)


def is_canonical_symbol(text: str) -> bool:
    """True only for one of the 13 canonical symbols with the exact code point."""
    t = nfc(text)
    return len(t) == 1 and t in CANONICAL_SYMBOLS and ord(t) == CANONICAL_SYMBOLS[t]


def is_sigma_id_v181(text: str) -> bool:
    t = nfc(text)
    return bool(SIGMA_ID_V181.match(t))


def is_nfc(text: str) -> bool:
    return unicodedata.is_normalized("NFC", text)
