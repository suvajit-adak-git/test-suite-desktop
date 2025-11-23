import shutil
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
import openpyxl
from fastapi import UploadFile, HTTPException
from app.utils.common import cell_fill_rgb

def save_upload_file(upload_file: UploadFile, dest: Path) -> None:
    with dest.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

def extract_from_excel_file(path: Path, max_preview_rows: int = 100) -> Dict[str, Any]:
    try:
        df = pd.read_excel(path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read excel file: {e}")

    headers = list(df.columns)
    nrows = int(len(df))
    preview_df = df.head(max_preview_rows).fillna("")
    preview = preview_df.to_dict(orient="records")
    sample_values = []
    if headers:
        first_col = headers[0]
        sample_values = [str(x).strip() for x in df[first_col].dropna().astype(str).unique().tolist()]

    return {"filename": path.name, "headers": headers, "nrows": nrows, "preview": preview, "sample_values": sample_values}

def extract_from_csv_file(path: Path, max_preview_rows: int = 100) -> Dict[str, Any]:
    df = None
    try:
        df = pd.read_csv(path, engine="python", sep=None)
    except Exception:
        for sep in [",", ";", "\t", "|"]:
            try:
                df = pd.read_csv(path, sep=sep)
                break
            except Exception:
                df = None
    if df is None:
        raise HTTPException(status_code=400, detail="Failed to parse CSV file (invalid format or delimiter).")

    df = df.dropna(how="all")
    df = df[~(df.astype(str).apply(lambda x: "".join(x).strip(), axis=1) == "")]

    headers = list(df.columns)
    nrows = int(len(df))
    preview_df = df.head(max_preview_rows).fillna("")
    preview = preview_df.to_dict(orient="records")
    sample_values = []
    if headers:
        first_col = headers[0]
        sample_values = [str(x).strip() for x in df[first_col].dropna().astype(str).unique().tolist()]

    return {"filename": path.name, "headers": headers, "nrows": nrows, "preview": preview, "sample_values": sample_values}

def extract_hyperlinks_with_versions_from_path(file_path: str, sheet_name: str = "Test Scenario Remarks") -> List[Dict[str, Any]]:
    p = Path(file_path)
    if not p.exists() or not p.is_file():
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

    try:
        workbook = openpyxl.load_workbook(p, data_only=True)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to open workbook: {e}")

    if sheet_name not in workbook.sheetnames:
        raise HTTPException(status_code=400, detail=f"Sheet '{sheet_name}' not found. Available: {', '.join(workbook.sheetnames)}")

    sheet = workbook[sheet_name]

    filename_col = None
    version_closed_col = None
    header_row = None

    for row_idx in range(1, min(21, sheet.max_row + 1)):
        for col_idx in range(1, sheet.max_column + 1):
            cell_value = sheet.cell(row_idx, col_idx).value
            if cell_value:
                cell_value_str = str(cell_value).strip().lower()
                if "filename" in cell_value_str:
                    filename_col = col_idx
                    header_row = row_idx
                if "version on which" in cell_value_str and "closed" in cell_value_str:
                    version_closed_col = col_idx
        if filename_col and version_closed_col:
            break

    if not filename_col or not version_closed_col:
        raise HTTPException(status_code=400, detail="Required columns not found ('Filename' and 'Version on which review closed').")

    results: List[Dict[str, Any]] = []

    for row_idx in range(header_row + 1, sheet.max_row + 1):
        filename_cell = sheet.cell(row_idx, filename_col)
        version_cell = sheet.cell(row_idx, version_closed_col)

        color = cell_fill_rgb(filename_cell)
        if color and len(color) >= 6:
            hexstr = color[-8:] if len(color) >= 8 else color
            try:
                if len(hexstr) == 8:
                    r = int(hexstr[2:4], 16)
                    g = int(hexstr[4:6], 16)
                    b = int(hexstr[6:8], 16)
                elif len(hexstr) == 6:
                    r = int(hexstr[0:2], 16)
                    g = int(hexstr[2:4], 16)
                    b = int(hexstr[4:6], 16)
                else:
                    r = g = b = 0
            except Exception:
                r = g = b = 0

            if g > r and g > b and g > 100:
                break

        filename = filename_cell.value
        version_closed = version_cell.value

        if not filename:
            continue

        hyperlink_url = None
        if getattr(filename_cell, "hyperlink", None):
            try:
                hyperlink_url = filename_cell.hyperlink.target
            except Exception:
                hyperlink_url = None

        filename_str = str(filename).strip() if filename is not None else None
        version_closed_str = str(version_closed).strip() if version_closed is not None else None

        results.append({
            "filename": filename_str,
            "hyperlink": hyperlink_url,
            "version_closed": version_closed_str,
            "row": row_idx
        })

    return results
