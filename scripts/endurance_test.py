import asyncio
import os
import psutil
import time
from app.orchestrator import Orchestrator
from app.cache.normalization import NormalizationCache
from scripts.benchmark_v6 import SimulatedEngine

async def run_endurance_test(iterations: int = 500):
    print(f"🏃 Starting Endurance Test ({iterations} iterations)...")
    process = psutil.Process(os.getpid())

    cloud = SimulatedEngine("cloud", 0.05, 0.15)
    local = SimulatedEngine("local", 0.1, 0.2)
    cache = NormalizationCache(max_size=100)
    orchestrator = Orchestrator(engines=[cloud, local], cache=cache)

    start_mem = process.memory_info().rss
    start_fds = len(process.open_files())

    for i in range(iterations):
        msg = f"message {i % 100}" # Some repetition to trigger cache
        await orchestrator.race_chat(msg)

        if (i + 1) % 100 == 0:
            mem = process.memory_info().rss
            fds = len(process.open_files())
            print(f"[{i+1}] Mem: {mem/1024/1024:.2f}MB, FDs: {fds}")

    end_mem = process.memory_info().rss
    end_fds = len(process.open_files())

    print("\n--- 📈 Endurance Results ---")
    print(f"Initial RAM: {start_mem/1024/1024:.2f}MB")
    print(f"Final RAM: {end_mem/1024/1024:.2f}MB")
    print(f"RAM Delta: {(end_mem - start_mem)/1024/1024:.2f}MB")
    print(f"Initial FDs: {start_fds}")
    print(f"Final FDs: {end_fds}")

if __name__ == "__main__":
    asyncio.run(run_endurance_test())
