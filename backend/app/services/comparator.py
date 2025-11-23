from typing import Dict, Any, List
from app.utils.common import (
    normalize_filename_for_match,
    normalize_version_string,
    extract_int_from_version,
    fuzzy_best_match
)

def compare_data(svn_rows: List[Dict[str, Any]], checklist_rows: List[Dict[str, Any]], fuzzy_threshold: float = 0.85) -> Dict[str, Any]:
    # Build canonical maps keyed by normalized filename (no extension)
    svn_map: Dict[str, Dict[str, Any]] = {}
    for r in svn_rows:
        # support both "File" or lowercase/other keys
        filename = r.get("File") if "File" in r else r.get("file") or r.get("Filename") or r.get("filename")
        if not filename:
            continue
        norm = normalize_filename_for_match(filename)
        svn_rev_raw = r.get("Last Changed Revision") or r.get("Last Changed Revision".lower()) or r.get("WC Revision") or r.get("revision") or r.get("Revision")
        svn_auth = r.get("Last Changed Author") or r.get("Last Changed Author".lower()) or r.get("last changed author") or r.get("Last Changed Author")
        svn_date = r.get("Last Changed Date") or r.get("Last Changed Date".lower()) or r.get("last changed date")
        svn_map[norm] = {
            "raw": r,
            "norm_name": norm,
            "filename_original": filename,
            "last_changed_revision_raw": normalize_version_string(svn_rev_raw),
            "last_changed_revision_int": extract_int_from_version(svn_rev_raw),
            "last_changed_author": svn_auth,
            "last_changed_date": svn_date
        }

    checklist_map: Dict[str, Dict[str, Any]] = {}
    checklist_norm_list: List[str] = []
    for r in checklist_rows:
        filename = r.get("filename") or r.get("Filename") or r.get("File")
        if not filename:
            continue
        norm = normalize_filename_for_match(filename)
        checklist_norm_list.append(norm)
        checklist_map[norm] = {
            "raw": r,
            "norm_name": norm,
            "filename_original": filename,
            "version_closed_raw": normalize_version_string(r.get("version_closed") or r.get("Version") or r.get("version")),
            "version_closed_int": extract_int_from_version(r.get("version_closed") or r.get("Version") or r.get("version"))
        }

    # Matching process
    matches = []
    mismatches = []
    only_in_svn = []
    only_in_checklist = []

    used_checklist_keys = set()

    # First pass: exact normalized matches
    for s_key, s in svn_map.items():
        if s_key in checklist_map:
            c = checklist_map[s_key]
            used_checklist_keys.add(s_key)

            # compare versions (prefer integer comparison when both available)
            s_ver_int = s["last_changed_revision_int"]
            c_ver_int = c["version_closed_int"]
            s_ver_raw = s["last_changed_revision_raw"]
            c_ver_raw = c["version_closed_raw"]

            version_equal = False
            if s_ver_int is not None and c_ver_int is not None:
                version_equal = (s_ver_int == c_ver_int)
            else:
                # fallback to trimmed string comparison
                version_equal = (s_ver_raw != "" and c_ver_raw != "" and s_ver_raw == c_ver_raw)

            entry = {
                "filename": s["filename_original"],
                "normalized_filename": s_key,
                "svn_revision_raw": s_ver_raw,
                "svn_revision_int": s_ver_int,
                "checklist_version_raw": c_ver_raw,
                "checklist_version_int": c_ver_int,
                "last_changed_author": s["last_changed_author"],
                "last_changed_date": s["last_changed_date"],
                "match_type": "exact",
                "score": 1.0
            }
            if version_equal:
                matches.append(entry)
            else:
                mismatches.append(entry)
        else:
            # not exact match; handle later with fuzzy
            pass

    # Second pass: for svn keys not matched, try fuzzy matching
    svn_unmatched = [k for k in svn_map.keys() if k not in {m["normalized_filename"] for m in matches + mismatches}]
    checklist_candidates = [k for k in checklist_map.keys() if k not in used_checklist_keys]

    for s_key in svn_unmatched:
        s = svn_map[s_key]
        best_candidate, score = fuzzy_best_match(s_key, checklist_candidates)
        if best_candidate and score >= fuzzy_threshold:
            # accept fuzzy match
            c = checklist_map[best_candidate]
            used_checklist_keys.add(best_candidate)
            checklist_candidates.remove(best_candidate)

            s_ver_int = s["last_changed_revision_int"]
            c_ver_int = c["version_closed_int"]
            s_ver_raw = s["last_changed_revision_raw"]
            c_ver_raw = c["version_closed_raw"]

            version_equal = False
            if s_ver_int is not None and c_ver_int is not None:
                version_equal = (s_ver_int == c_ver_int)
            else:
                version_equal = (s_ver_raw != "" and c_ver_raw != "" and s_ver_raw == c_ver_raw)

            entry = {
                "filename": s["filename_original"],
                "normalized_filename": s_key,
                "matched_checklist_filename": c["filename_original"],
                "matched_checklist_normalized": best_candidate,
                "svn_revision_raw": s_ver_raw,
                "svn_revision_int": s_ver_int,
                "checklist_version_raw": c_ver_raw,
                "checklist_version_int": c_ver_int,
                "last_changed_author": s["last_changed_author"],
                "last_changed_date": s["last_changed_date"],
                "match_type": "fuzzy",
                "score": score
            }
            if version_equal:
                matches.append(entry)
            else:
                mismatches.append(entry)
        else:
            # no match found
            only_in_svn.append({
                "filename": s["filename_original"],
                "normalized_filename": s_key,
                "last_changed_revision_raw": s["last_changed_revision_raw"],
                "last_changed_revision_int": s["last_changed_revision_int"],
                "last_changed_author": s["last_changed_author"],
                "last_changed_date": s["last_changed_date"]
            })

    # Any checklist keys left unused are only_in_checklist
    for c_key, c in checklist_map.items():
        if c_key not in used_checklist_keys:
            only_in_checklist.append({
                "filename": c["filename_original"],
                "normalized_filename": c_key,
                "version_closed_raw": c["version_closed_raw"],
                "version_closed_int": c["version_closed_int"],
                "raw": c["raw"]
            })

    return {
        "status": "ok",
        "summary": {
            "matches": len(matches),
            "mismatches": len(mismatches),
            "only_in_svn": len(only_in_svn),
            "only_in_checklist": len(only_in_checklist)
        },
        "matches": matches,
        "mismatches": mismatches,
        "only_in_svn": only_in_svn,
        "only_in_checklist": only_in_checklist
    }
