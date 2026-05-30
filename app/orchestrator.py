import asyncio
import time
from typing import List, Optional
from app.engines.base import BaseEngine, EngineResult
from app.cache.normalization import NormalizationCache

class Orchestrator:
    def __init__(self, engines: List[BaseEngine], cache: Optional[NormalizationCache] = None):
        self.engines = engines
        self.cache = cache

    async def race_chat(self, message: str) -> EngineResult:
        # Check cache first
        if self.cache:
            cached_result = self.cache.get(message)
            if cached_result:
                return cached_result

        if not self.engines:
            raise ValueError("No engines configured")

        # Create tasks for all engines
        tasks = [asyncio.create_task(engine.chat(message)) for engine in self.engines]

        # We will keep track of tasks to cancel them later
        pending = set(tasks)

        while pending:
            done, pending = await asyncio.wait(
                pending,
                return_when=asyncio.FIRST_COMPLETED
            )

            for task in done:
                try:
                    result = task.result()
                    if result.status == "ok":
                        # We found a winner! Cancel everything else.
                        for p in pending:
                            p.cancel()

                        if self.cache:
                            self.cache.set(message, result)
                        return result
                    else:
                        print(f"Engine {result.engine_name} returned non-ok status: {result.status}")
                except Exception as e:
                    print(f"Engine task failed with exception: {e}")

        raise RuntimeError("All engines failed to provide a valid response")
