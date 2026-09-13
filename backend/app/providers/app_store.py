"""
Adaptateur pour Apple App Store (Cahier des charges #4).
Utilise l'API publique iTunes Search/Lookup et les flux RSS Top Charts.
"""

import httpx
import time
from typing import List, Dict, Any
from app.providers.base import BaseDataProvider

class AppStoreProvider(BaseDataProvider):
    def __init__(self):
        super().__init__(source_id="app_store", name="Apple App Store")
        self.base_url = "https://itunes.apple.com"

    async def check_health(self) -> Dict[str, Any]:
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/us/rss/toppaidapplications/limit=1/json")
                duration = int((time.time() - start) * 1000)
                if resp.status_code == 200:
                    self.record_success(count=1, response_ms=duration)
                    return {"status": "OPERATIONAL", "response_time_ms": duration}
                else:
                    self.record_failure(f"HTTP {resp.status_code}")
                    return {"status": "DEGRADED", "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            self.record_failure(str(e))
            return {"status": "ERROR", "error": str(e)}

    async def fetch_data(self, country: str = "us", category: str = "productivity", limit: int = 50) -> List[Dict[str, Any]]:
        """Collecte les flux réels App Store."""
        url = f"{self.base_url}/{country.lower()}/rss/topfreeapplications/limit={limit}/json"
        start = time.time()
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url)
                duration = int((time.time() - start) * 1000)
                if resp.status_code == 200:
                    data = resp.json()
                    entries = data.get("feed", {}).get("entry", [])
                    results = []
                    for rank, item in enumerate(entries, 1):
                        results.append({
                            "id": item.get("id", {}).get("attributes", {}).get("im:id"),
                            "bundle_id": item.get("id", {}).get("attributes", {}).get("im:bundleId", "unknown"),
                            "name": item.get("im:name", {}).get("label"),
                            "category": item.get("category", {}).get("attributes", {}).get("label"),
                            "developer": item.get("im:artist", {}).get("label"),
                            "icon_url": item.get("im:image", [{}])[-1].get("label"),
                            "price": 0.0,
                            "rank": rank,
                            "country": country.upper(),
                            "platform": "ios"
                        })
                    self.record_success(count=len(results), response_ms=duration)
                    return results
                else:
                    self.record_failure(f"HTTP {resp.status_code}")
                    return []
        except Exception as e:
            self.record_failure(str(e))
            return []

app_store_provider = AppStoreProvider()
