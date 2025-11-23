from typing import Optional
from pydantic import BaseModel

class LocalPathsRequest(BaseModel):
    svn_path: str
    checklist_path: str
    sheet_name: Optional[str] = "Test Scenario Remarks"
