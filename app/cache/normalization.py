import hashlib
import time
from typing import Optional, Dict, OrderedDict
from app.engines.base import EngineResult
import collections

class NormalizationCache:
    """
    Normalization Cache with TTL and LRU-like eviction.
    """
    def __init__(self, ttl: int = 3600, max_size: int = 1000):
        self.cache: Dict[str, Dict] = collections.OrderedDict()
        self.ttl = ttl
        self.max_size = max_size

    def _hash(self, text: str, model_config: str = "v6b-default") -> str:
        # Include model_config in hash to avoid cross-version/engine stale responses
        normalized = text.lower().strip()
        data = f"{normalized}|{model_config}"
        return hashlib.sha256(data.encode()).hexdigest()

    def get(self, message: str) -> Optional[EngineResult]:
        key = self._hash(message)
        if key in self.cache:
            entry = self.cache[key]
            # Move to end (MRU)
            self.cache.move_to_end(key)

            if time.time() - entry["timestamp"] < self.ttl:
                return EngineResult(
                    response=entry["response"],
                    engine_name="cache",
                    latency=0.0,
                    status="ok"
                )
            else:
                del self.cache[key]
        return None

    def set(self, message: str, result: EngineResult):
        if result.status == "ok":
            key = self._hash(message)

            # Evict oldest if full
            if len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)

            self.cache[key] = {
                "response": result.response,
                "timestamp": time.time()
            }
            self.cache.move_to_end(key)
