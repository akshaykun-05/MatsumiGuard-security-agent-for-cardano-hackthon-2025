from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import random
import string

from schemas.requests import AnalyzeTransactionRequest
from schemas.responses import AnalyzeTransactionResponse
from services.risk_engine import analyze_transaction


router = APIRouter(tags=["Transactions"])


def generate_fake_transaction(tx_hash: str) -> dict:
    """Generate realistic fake Cardano transaction data."""
    # Generate realistic data based on the hash
    random.seed(int(tx_hash[:8], 16))  # Seed with first 8 chars of hash for consistency
    
    num_inputs = random.randint(1, 5)
    num_outputs = random.randint(1, 8)
    
    return {
        "hash": tx_hash,
        "block": f"#{random.randint(9000000, 9500000)}",
        "era": "Babbage",
        "epoch": random.randint(400, 450),
        "slot": random.randint(100000, 120000000),
        "timestamp": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat() + "Z",
        "confirmations": random.randint(1000, 50000),
        "size": random.randint(300, 8000),
        "fee": f"{random.randint(160000, 500000)} lovelace",
        "status": "SUCCESS",
        "inputs": [
            {
                "address": f"addr1qymnqvscmt76g2f58sm0qqq8a4ztknqa5asp3z5ydqd8{''.join(random.choices(string.ascii_lowercase + string.digits, k=52))}",
                "amount": f"{random.randint(1000000, 50000000)} lovelace",
                "tokens": random.randint(0, 3)
            }
            for _ in range(num_inputs)
        ],
        "outputs": [
            {
                "address": f"addr1qz{''.join(random.choices(string.ascii_lowercase + string.digits, k=52))}",
                "amount": f"{random.randint(1000000, 10000000)} lovelace",
                "tokens": random.randint(0, 2)
            }
            for _ in range(num_outputs)
        ],
        "metadata": {
            "label": "674",
            "content": {
                "msg": ["Cardano Compliance Analysis Result"],
                "score": random.randint(20, 95)
            }
        },
        "validity": {
            "valid_from": random.randint(100000000, 120000000),
            "valid_to": random.randint(120000001, 150000000)
        },
        "mint": [],
        "certificates": [],
        "withdrawals": []
    }


@router.get("/transaction/{tx_hash}")
async def get_transaction_details(tx_hash: str):
    """
    Fetch fake transaction details for display.
    Returns mock data that matches the format of a real Cardano transaction.
    """
    if not tx_hash or len(tx_hash) != 64:
        raise HTTPException(
            status_code=400,
            detail="Invalid transaction hash. Must be 64 hexadecimal characters."
        )
    
    try:
        tx_data = generate_fake_transaction(tx_hash)
        return {
            "success": True,
            "data": tx_data,
            "message": "Transaction data retrieved (simulated for demo purposes)"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching transaction: {str(e)}"
        )


@router.post("/analyzeTransaction", response_model=AnalyzeTransactionResponse)
async def analyze_transaction_route(payload: AnalyzeTransactionRequest):
    """
    Analyze a Cardano transaction for risk & compliance.
    """
    try:
        result = await analyze_transaction(
            tx_hash=payload.txHash,
            wallet_address=payload.walletAddress,
            metadata=payload.metadata or {},
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing transaction: {str(e)}"
        )


