from typing import List

from pydantic import BaseModel, Field


class AnalyzeTransactionResponse(BaseModel):
    txHash: str = Field(..., description="Cardano transaction hash")
    complianceScore: int = Field(..., ge=0, le=100, description="0-100 score")
    riskLevel: str = Field(..., description="Risk level: Low, Medium, High")
    issues: List[str] = Field(default_factory=list, description="List of detected issues")
    recommendations: List[str] = Field(
        default_factory=list, description="Recommended next actions"
    )


