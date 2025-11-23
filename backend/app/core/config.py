import tempfile
from pathlib import Path

UPLOAD_DIR = Path(tempfile.gettempdir()) / "uploads_backend"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
