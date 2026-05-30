import httpx
import time
from app.engines.base import BaseEngine, EngineResult

class LocalEngine(BaseEngine):
    """
    Local Engine optimized for 8GB RAM laptops.
    """
    def __init__(self, client: httpx.AsyncClient, base_url: str = "http://localhost:8080"):
        super().__init__("local", client=client)
        self.base_url = base_url

    async def chat(self, message: str) -> EngineResult:
        start_time = time.time()
        url = f"{self.base_url}/completion"
        # Aggressive context capping for 8GB RAM target
        payload = {
            "prompt": f"\n\n### Instruction:\n{message}\n\n### Response:\n",
            "n_predict": 256,   # Capped aggressively
            "n_ctx": 1024,      # Small context window to save RAM
            "stream": False,
            "stop": ["###", "Instruction:", "Response:"]
        }

        try:
            # Use shared client for connection pooling
            # Short timeout to allow Cloud path to win if Local is struggling
            response = await self.client.post(url, json=payload, timeout=20.0)
            response.raise_for_status()
            data = response.json()

            return EngineResult(
                response=data["content"].strip(),
                engine_name=self.name,
                latency=time.time() - start_time,
                status="ok"
            )
        except Exception as e:
            return EngineResult(
                response=str(e),
                engine_name=self.name,
                latency=time.time() - start_time,
                status="error"
            )
