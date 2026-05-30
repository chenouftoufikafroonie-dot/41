from abc import ABC, abstractmethod
from pydantic import BaseModel
import httpx

class EngineResult(BaseModel):
    response: str
    engine_name: str
    latency: float
    status: str = "ok"

class BaseEngine(ABC):
    def __init__(self, name: str, client: httpx.AsyncClient = None):
        self.name = name
        self.client = client or httpx.AsyncClient()

    @abstractmethod
    async def chat(self, message: str) -> EngineResult:
        pass
