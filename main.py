import asyncio
import os
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from app.orchestrator import Orchestrator
from app.engines.cloudflare import CloudflareEngine
from app.engines.local import LocalEngine
from app.cache.normalization import NormalizationCache

load_dotenv()

# Lifecycle management for shared HTTP client
class AppState:
    client: Optional[httpx.AsyncClient] = None
    orchestrator: Optional[Orchestrator] = None

state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize shared client
    state.client = httpx.AsyncClient()

    # Initialize cache
    cache = NormalizationCache()

    # Initialize engines with shared client
    cf_engine = CloudflareEngine(
        account_id=os.getenv("CLOUDFLARE_ACCOUNT_ID", ""),
        api_token=os.getenv("CLOUDFLARE_API_TOKEN", ""),
        client=state.client,
        model=os.getenv("DEFAULT_MODEL", "@cf/meta/llama-3-8b-instruct")
    )
    local_engine = LocalEngine(
        client=state.client,
        base_url=os.getenv("LOCAL_LLM_URL", "http://localhost:8080")
    )

    state.orchestrator = Orchestrator(engines=[cf_engine, local_engine], cache=cache)

    yield

    # Cleanup
    await state.client.aclose()

app = FastAPI(title="CHMP005 V6-B API", lifespan=lifespan)

class ChatRequest(BaseModel):
    message: str
    stream: bool = False

class ChatResponse(BaseModel):
    response: str
    engine: str
    latency: float

@app.get("/health")
async def health():
    return {"status": "ok", "version": "6.0.0-B"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not state.orchestrator:
        raise HTTPException(status_code=503, detail="Orchestrator not initialized")

    try:
        result = await state.orchestrator.race_chat(request.message)
        return ChatResponse(
            response=result.response,
            engine=result.engine_name,
            latency=result.latency
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
