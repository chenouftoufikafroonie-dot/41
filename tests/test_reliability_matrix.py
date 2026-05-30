import pytest
import asyncio
from app.orchestrator import Orchestrator
from app.engines.base import BaseEngine, EngineResult

class ControlledEngine(BaseEngine):
    def __init__(self, name, status="ok", delay=0.01):
        super().__init__(name, client=None)
        self.status = status
        self.delay = delay

    async def chat(self, message: str) -> EngineResult:
        await asyncio.sleep(self.delay)
        return EngineResult(response=f"Response from {self.name}", engine_name=self.name, latency=self.delay, status=self.status)

@pytest.mark.asyncio
async def test_cloudflare_available_local_available():
    cf = ControlledEngine("cloudflare", delay=0.01)
    local = ControlledEngine("local", delay=0.05)
    orchestrator = Orchestrator(engines=[cf, local])
    result = await orchestrator.race_chat("hi")
    assert result.engine_name == "cloudflare"

@pytest.mark.asyncio
async def test_cloudflare_unavailable_local_available():
    cf = ControlledEngine("cloudflare", status="error", delay=0.01)
    local = ControlledEngine("local", delay=0.05)
    orchestrator = Orchestrator(engines=[cf, local])
    result = await orchestrator.race_chat("hi")
    assert result.engine_name == "local"

@pytest.mark.asyncio
async def test_cloudflare_available_local_unavailable():
    cf = ControlledEngine("cloudflare", delay=0.05)
    local = ControlledEngine("local", status="error", delay=0.01)
    orchestrator = Orchestrator(engines=[cf, local])
    result = await orchestrator.race_chat("hi")
    assert result.engine_name == "cloudflare"

@pytest.mark.asyncio
async def test_both_engines_degraded():
    # Both slow, Cloud wins because it's first in list if same latency
    cf = ControlledEngine("cloudflare", delay=0.2)
    local = ControlledEngine("local", delay=0.2)
    orchestrator = Orchestrator(engines=[cf, local])
    result = await orchestrator.race_chat("hi")
    assert result.status == "ok"

@pytest.mark.asyncio
async def test_both_engines_unavailable():
    cf = ControlledEngine("cloudflare", status="error")
    local = ControlledEngine("local", status="error")
    orchestrator = Orchestrator(engines=[cf, local])
    with pytest.raises(RuntimeError, match="All engines failed"):
        await orchestrator.race_chat("hi")
