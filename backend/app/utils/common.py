import re
import difflib
from pathlib import Path
from typing import Optional, List, Tuple

def strip_extension(name: str) -> str:
    # Path.stem removes extension, but for names that include paths we use basename then stem
    try:
        return Path(name).stem
    except Exception:
        # fallback: remove last dot extension
        if "." in name:
            return ".".join(name.split(".")[:-1])
        return name

def normalize_filename_for_match(name: Optional[str]) -> str:
    if not name:
        return ""
    s = str(name).strip().lower()
    
    # Extract extension separately
    extension = ""
    if "." in s:
        parts = s.rsplit(".", 1)
        s = parts[0]
        extension = parts[1]
    
    # replace non-alphanumeric with space, collapse whitespace
    s = re.sub(r"[^0-9a-z]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    
    # Add extension back to prevent collisions (e.g., file.stp vs file.trf)
    if extension:
        s = f"{s} {extension}"
    
    return s

def extract_int_from_version(s: Optional[str]) -> Optional[int]:
    """
    Try to extract integer version from strings like 'v20157', ' 20157 ', '20157.0' etc.
    Returns int or None if not parseable.
    """
    if s is None:
        return None
    s = str(s).strip()
    # find first group of digits
    m = re.search(r"(\d+)", s)
    if not m:
        return None
    try:
        return int(m.group(1))
    except Exception:
        return None

def normalize_version_string(s: Optional[str]) -> str:
    if s is None:
        return ""
    return str(s).strip()

def fuzzy_best_match(key: str, candidates: List[str]) -> Tuple[Optional[str], float]:
    """
    Return (best_candidate, score) using difflib.SequenceMatcher ratio.
    Score is between 0..1. If no candidates, returns (None, 0.0)
    """
    if not candidates:
        return None, 0.0
    best = None
    best_score = 0.0
    for c in candidates:
        score = difflib.SequenceMatcher(None, key, c).ratio()
        if score > best_score:
            best_score = score
            best = c
    return best, best_score

def cell_fill_rgb(cell) -> Optional[str]:
    try:
        f = cell.fill
        if not f:
            return None
        color = f.start_color
        if color is None:
            return None
        rgb = getattr(color, "rgb", None)
        if rgb:
            return str(rgb).upper()
        return None
    except Exception:
        return None
