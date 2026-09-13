import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Optional, Dict

class CacheManager:
    def __init__(self):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}

    @staticmethod
    def generate_hash(content: Any, prompt_version: str = "v1.0", model: str = "gemini-2.5-flash") -> str:
        """Génère une empreinte SHA256 pour éviter la réanalyse de contenus identiques."""
        if isinstance(content, (dict, list)):
            content_str = json.dumps(content, sort_keys=True, ensure_ascii=False)
        else:
            content_str = str(content)
        raw = f"{prompt_version}:{model}:{content_str}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        entry = self._memory_cache.get(key)
        if entry:
            return entry["data"]
        return None

    def set(self, key: str, data: Any, metadata: Optional[Dict[str, Any]] = None):
        self._memory_cache[key] = {
            "data": data,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    def clear(self):
        self._memory_cache.clear()

cache_manager = CacheManager()
