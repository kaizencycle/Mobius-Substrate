from pathlib import Path
from fastapi import APIRouter, HTTPException
import os, zipfile, re

router = APIRouter()
DATA_DIR = Path(os.getenv("LEDGER_PATH", "data"))
ARCHIVE_DIR = Path(os.getenv("ARCHIVE_PATH", "archive"))

# Date format validation for path safety
DATE_PATTERN = re.compile(r'^\d{4}-\d{2}-\d{2}$')

def _validate_date_path(date: str) -> None:
    """Validate date string to prevent path traversal."""
    if not DATE_PATTERN.match(date):
        raise ValueError(f"Invalid date format: {date}")
    if '..' in date or '/' in date or '\\' in date:
        raise ValueError(f"Invalid characters in date: {date}")

def _safe_path(base_dir: Path, component: str) -> Path:
    """Safely resolve a path within the base directory."""
    full_path = (base_dir / component).resolve()
    base_resolved = base_dir.resolve()
    try:
        full_path.relative_to(base_resolved)
    except ValueError:
        raise ValueError(f"Path traversal detected: {component}")
    return full_path

def _zip_day_folder(date: str) -> str:
    _validate_date_path(date)
    day_dir = _safe_path(DATA_DIR, date)
    root_file = _safe_path(DATA_DIR, f"{date}.root.json")  # Root file is in root directory
    if not root_file.exists():
        raise FileNotFoundError(f"Merkle root missing: {root_file}. Seal day first.")

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = _safe_path(ARCHIVE_DIR, f"{date}.zip")
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for p in day_dir.rglob("*"):
            if p.is_file():
                z.write(p, p.relative_to(DATA_DIR))
    return str(zip_path)

@router.post("/archive/{date}")
def archive_day(date: str):
    try:
        zip_file = _zip_day_folder(date)
        return {"ok": True, "archive_status": "Archive sealed successfully.", "zip_file": zip_file}
    except FileNotFoundError as e:
        raise HTTPException(status_code=409, detail=str(e))

