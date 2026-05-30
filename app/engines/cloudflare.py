import httpx
import time
from app.engines.base import BaseEngine, EngineResult

class CloudflareEngine(BaseEngine):
    def __init__(self, account_id: str, api_token: str, client: httpx.AsyncClient, model: str = "@cf/meta/llama-3-8b-instruct"):
        super().__init__("cloudflare", client=client)
        self.account_id = account_id
        self.api_token = api_token
        self.model = model
        self.url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}"

    async def chat(self, message: str) -> EngineResult:
        start_time = time.time()
        headers = {"Authorization": f"Bearer {self.api_token}"}
        payload = {"messages": [{"role": "user", "content": message}]}

        try:
            # Use shared client for connection pooling
            response = await self.client.post(self.url, headers=headers, json=payload, timeout=10.0)

            if response.status_code == 401:
                return EngineResult(
                    response="Cloudflare Auth Failed",
                    engine_name=self.name,
                    latency=time.time() - start_time,
                    status="error_auth"
                )

            response.raise_for_status()
            data = response.json()

            return EngineResult(
                response=data["result"]["response"],
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
