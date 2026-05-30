# ⚡ BoB Performance Journal - CHMP005 V6-B

## 2026-05-30 - [8GB RAM Optimization Strategy]
**Learning:** In 8GB RAM environments (like Alpine Live USB), the main risk is memory pressure from local inference (llama.cpp). Racing Local vs Cloud provides speed, but Local must be capped to avoid OOM or starving the API.

**Action:**
1. Capped `n_ctx` to 1024 and `n_predict` to 256 for local inference.
2. Limited `llama-server` threads to 4 to prevent UI/API thread starvation.
3. Implemented aggressive task cancellation in the orchestrator to prevent orphaned background inference jobs from consuming RAM.
4. Used a shared `httpx.AsyncClient` to leverage connection pooling and reduce TCP/TLS overhead.
5. Implemented a `NormalizationCache` with LRU-like eviction and TTL to reduce redundant computations.

## Architecture: V6-B Dual-Engine Race
- **Goal:** Minimize perceived latency and ensure 100% availability.
- **Race Path:** parallel(Cloudflare AI, Local llama.cpp).
- **Optimization:** First successful response wins; pending tasks are cancelled immediately.
- **Fallback:** Robust iteration through all engines if the fastest one fails.
