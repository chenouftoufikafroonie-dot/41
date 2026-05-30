import pytest
import asyncio
from app.orchestrator import Orchestrator
from app.engines.base import BaseEngine, EngineResult

class CancelTrackerEngine(BaseEngine):
    def __init__(self, name, delay):
        super().__init__(name, client=None)
        self.delay = delay
        self.was_cancelled = False

    async def chat(self, message: str) -> EngineResult:
        try:
            await asyncio.sleep(self.delay)
            return EngineResult(response="ok", engine_name=self.name, latency=self.delay)
        except asyncio.CancelledError:
            self.was_cancelled = True
            raise

@pytest.mark.asyncio
async def test_race_cancellation():
    fast = CancelTrackerEngine("fast", 0.01)
    slow = CancelTrackerEngine("slow", 2.0)
    orchestrator = Orchestrator(engines=[fast, slow])

    await orchestrator.race_chat("hello")

    # Wait a bit to ensure cancellation propagation
    await asyncio.sleep(0.1)
    assert slow.was_cancelled is True
    assert fast.was_cancelled is False
