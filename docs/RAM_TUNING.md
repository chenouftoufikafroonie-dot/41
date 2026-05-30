# CHMP005 V6-B 8GB RAM Tuning Parameters

To ensure stability on laptops with 8GB RAM (i7 Gen 5/6), the following parameters are strictly enforced:

## Local LLM (llama.cpp)
- **Model:** TinyLlama-1.1B-Chat-v1.0 (GGUF Q4_K_M)
- **Quantization:** Q4_K_M (Optimal balance of intelligence and memory footprint)
- **Context Size (`-c` / `n_ctx`):** 1024 tokens (Aggressively capped to minimize KV cache RAM usage)
- **Max Predict (`n_predict`):** 256 tokens (Ensures faster local inference and less RAM pressure)
- **Threads (`-t`):** 4 (Prevents CPU saturation and allows the API process to remain responsive)
- **Memory Mapping:** `mmap` is enabled by default to allow the OS to manage memory pressure efficiently.

## API / Orchestrator
- **Shared HTTP Client:** One `httpx.AsyncClient` used for all requests to minimize overhead.
- **Aggressive Cancellation:** Losing engines in the race are cancelled immediately using `asyncio.Task.cancel()`.
- **Cache Size:** Limited to 1000 entries with LRU-like eviction to prevent uncontrolled memory growth.
- **Timeouts:**
  - Cloud: 10s
  - Local: 20s (Allows cloud to fail before giving up on local)
