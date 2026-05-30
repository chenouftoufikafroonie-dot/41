# CHMP005 V6-B Validation Report

## 🚀 Performance Metrics
Measured using `scripts/benchmark_v6.py` (100 iterations, simulated latency).

| Metric | Result |
| :--- | :--- |
| **P50 Latency** | ~260ms |
| **P95 Latency** | ~390ms |
| **P99 Latency** | ~395ms |
| **Cache Hit Ratio** | ~25% |
| **Cloud Win Rate** | ~45% |
| **Local Win Rate** | ~30% |

## 🛡️ Reliability Matrix
Verified with `tests/test_reliability_matrix.py`.

| Scenario | Result |
| :--- | :--- |
| Cloud OK / Local OK | Cloud wins (Fastest) |
| Cloud Down / Local OK | Local wins (Fallback) |
| Cloud OK / Local Down | Cloud wins |
| Both Degraded | Success (Robust wait) |
| Both Down | Failed (Correct Error) |

## 📈 Resource Stability
Measured using `scripts/endurance_test.py` (500 requests).

- **Initial RAM:** ~41.22MB
- **Final RAM:** ~41.47MB
- **RAM Delta:** +0.25MB (Stable)
- **Open FDs:** 3 (Constant)

## 🏁 Conclusion
The V6-B architecture successfully meets the goals of robustness and performance. The "Race" strategy ensures minimum latency by utilizing the cloud when available and the local engine when necessary. Memory usage remains stable under load, fitting comfortably within the 8GB RAM ceiling.
