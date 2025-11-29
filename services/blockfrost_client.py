import os
from typing import Any, Dict, List, Optional

import httpx


class BlockfrostClient:
    """
    Minimal async Blockfrost client for Cardano mainnet.

    Requires `BLOCKFROST_PROJECT_ID` env var.
    See: https://docs.blockfrost.io
    """

    def __init__(self, project_id: Optional[str] = None, network: str = "mainnet"):
        self.project_id = project_id or os.getenv("BLOCKFROST_PROJECT_ID", "")
        if not self.project_id:
            raise RuntimeError("BLOCKFROST_PROJECT_ID environment variable is required")

        base_map = {
            "mainnet": "https://cardano-mainnet.blockfrost.io/api/v0",
            "preprod": "https://cardano-preprod.blockfrost.io/api/v0",
            "preview": "https://cardano-preview.blockfrost.io/api/v0",
        }
        self.base_url = base_map.get(network, base_map["mainnet"])
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"project_id": self.project_id},
            timeout=15.0,
        )

    async def close(self):
        await self._client.aclose()

    async def get_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """
        Example: basic transaction info
        GET /txs/{hash}
        """
        resp = await self._client.get(f"/txs/{tx_hash}")
        resp.raise_for_status()
        return resp.json()

    async def get_transaction_utxos(self, tx_hash: str) -> Dict[str, Any]:
        """
        Example: UTXOs, including sender/receiver addresses and assets.
        GET /txs/{hash}/utxos
        """
        resp = await self._client.get(f"/txs/{tx_hash}/utxos")
        resp.raise_for_status()
        return resp.json()

    async def get_address_txs(
        self, address: str, count: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Example: recent transactions for an address.
        GET /addresses/{address}/transactions
        """
        params = {"order": "desc", "count": count}
        resp = await self._client.get(f"/addresses/{address}/transactions", params=params)
        resp.raise_for_status()
        return resp.json()


