import asyncio
import time
import statistics
import random
from typing import List, Dict
from app.orchestrator import Orchestrator
from app.engines.base import BaseEngine, EngineResult
from app.cache.normalization import NormalizationCache

class SimulatedEngine(BaseEngine):
    def __init__(self, name: str, min_lat: float, max_lat: float, failure_rate: float = 0.0):
        super().__init__(name, client=None)
        self.min_lat = min_lat
        self.max_lat = max_lat
        self.failure_rate = failure_rate
        self.wins = 0

    async def chat(self, message: str) -> EngineResult:
        latency = random.uniform(self.min_lat, self.max_lat)
        await asyncio.sleep(latency)
        if random.random() < self.failure_rate:
            return EngineResult(response="error", engine_name=self.name, latency=latency, status="error")
        return EngineResult(response=f"Response from {self.name}", engine_name=self.name, latency=latency, status="ok")

async def run_benchmark(iterations: int = 100):
    print(f"🚀 Starting V6-B Benchmark ({iterations} iterations)...")

    # Setup: Cloud (faster but variable) vs Local (slower but stable)
    cloud = SimulatedEngine("cloud", 0.1, 0.5, failure_rate=0.05)
    local = SimulatedEngine("local", 0.3, 0.4, failure_rate=0.01)
    cache = NormalizationCache(max_size=100)
    orchestrator = Orchestrator(engines=[cloud, local], cache=cache)

    latencies = []
    wins = {"cloud": 0, "local": 0, "cache": 0}

    # 1. Warmup / Cache filling
    messages = [f"unique message {i}" for i in range(10)]
    for m in messages:
        await orchestrator.race_chat(m)

    # 2. Benchmark Loop
    for i in range(iterations):
        # 20% chance of repeating a message to test cache
        if random.random() < 0.2:
            msg = random.choice(messages)
        else:
            msg = f"iteration {i}"

        start = time.time()
        result = await orchestrator.race_chat(msg)
        end = time.time()

        latencies.append(end - start)
        wins[result.engine_name] += 1

    # Statistics
    p50 = statistics.median(latencies)
    latencies.sort()
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]
    avg = statistics.mean(latencies)

    print("\n--- 📊 Performance Results ---")
    print(f"P50 Latency: {p50*1000:.2f}ms")
    print(f"P95 Latency: {p95*1000:.2f}ms")
    print(f"P99 Latency: {p99*1000:.2f}ms")
    print(f"Avg Latency: {avg*1000:.2f}ms")

    print("\n--- 🎯 Engine Win Rates ---")
    total = sum(wins.values())
    for engine, count in wins.items():
        print(f"{engine.capitalize()}: {count} ({count/total*100:.1f}%)")

    print("\n--- 🧬 Cache Stats ---")
    print(f"Cache Hit Ratio: {wins['cache']/total*100:.1f}%")

if __name__ == "__main__":
    asyncio.run(run_benchmark())
