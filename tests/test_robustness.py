import pytest
import asyncio
from app.orchestrator import Orchestrator
from app.engines.base import BaseEngine, EngineResult

class FailureEngine(BaseEngine):
    def __init__(self, name, behavior="fail", delay=0.01):
        super().__init__(name, client=None)
        self.behavior = behavior
        self.delay = delay

    async def chat(self, message: str) -> EngineResult:
        await asyncio.sleep(self.delay)
        if self.behavior == "fail":
            return EngineResult(response="error", engine_name=self.name, latency=self.delay, status="error")
        elif self.behavior == "exception":
            raise RuntimeError("Crashed")
        elif self.behavior == "slow_ok":
            return EngineResult(response="slow_ok", engine_name=self.name, latency=self.delay, status="ok")
        return EngineResult(response="ok", engine_name=self.name, latency=self.delay, status="ok")

@pytest.mark.asyncio
async def test_failure_matrix_all_fail():
    e1 = FailureEngine("e1", "fail")
    e2 = FailureEngine("e2", "exception")
    orchestrator = Orchestrator(engines=[e1, e2])

    with pytest.raises(RuntimeError, match="All engines failed"):
        await orchestrator.race_chat("hello")

@pytest.mark.asyncio
async def test_failure_matrix_one_ok_one_fail():
    e1 = FailureEngine("e1", "fail", delay=0.01)
    e2 = FailureEngine("e2", "slow_ok", delay=0.05)
    orchestrator = Orchestrator(engines=[e1, e2])

    result = await orchestrator.race_chat("hello")
    assert result.engine_name == "e2"
    assert result.response == "slow_ok"

@pytest.mark.asyncio
async def test_sustained_load_simulation():
    # Simulating sustained load to ensure no "leaks" in our logic
    ok_engine = FailureEngine("ok", behavior="ok", delay=0.01)
    orchestrator = Orchestrator(engines=[ok_engine])

    for _ in range(50):
        result = await orchestrator.race_chat("repeat load test")
        assert result.status == "ok"
