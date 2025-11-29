from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class AnalyzeTransactionRequest(BaseModel):
    txHash: str = Field(..., description="Cardano transaction hash")
    walletAddress: str = Field(..., description="Wallet address of interest")
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Optional transaction metadata (off-chain / app-level)"
    )


