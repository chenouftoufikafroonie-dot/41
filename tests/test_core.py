import pytest
import asyncio
import time
import httpx
from app.orchestrator import Orchestrator
from app.engines.base import BaseEngine, EngineResult
from app.cache.normalization import NormalizationCache

class MockEngine(BaseEngine):
    def __init__(self, name, delay, response="ok", status="ok"):
        # We pass a dummy client as it's not used in this mock
        super().__init__(name, client=None)
        self.delay = delay
        self.response = response
        self.status = status
        self.called = 0

    async def chat(self, message: str) -> EngineResult:
        self.called += 1
        await asyncio.sleep(self.delay)
        return EngineResult(
            response=self.response,
            engine_name=self.name,
            latency=self.delay,
            status=self.status
        )

@pytest.mark.asyncio
async def test_race_winner():
    fast = MockEngine("fast", 0.01)
    slow = MockEngine("slow", 1.0)
    orchestrator = Orchestrator(engines=[fast, slow])

    result = await orchestrator.race_chat("hello")
    assert result.engine_name == "fast"
    assert result.response == "ok"

@pytest.mark.asyncio
async def test_race_fallback_multiple():
    fail1 = MockEngine("fail1", 0.01, status="error")
    fail2 = MockEngine("fail2", 0.02, status="error")
    slow_ok = MockEngine("slow_ok", 0.05)
    orchestrator = Orchestrator(engines=[fail1, fail2, slow_ok])

    result = await orchestrator.race_chat("hello")
    assert result.engine_name == "slow_ok"

@pytest.mark.asyncio
async def test_cache_normalization():
    engine = MockEngine("engine", 0.01, response="cached_val")
    cache = NormalizationCache()
    orchestrator = Orchestrator(engines=[engine], cache=cache)

    # First call
    await orchestrator.race_chat("  Hello  ")
    assert engine.called == 1

    # Second call with different casing/spacing
    result = await orchestrator.race_chat("hello")
    assert result.engine_name == "cache"
    assert engine.called == 1
