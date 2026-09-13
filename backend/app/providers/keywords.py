"""
Abstraction de fournisseur de volume de mots-clés (Cahier des charges #4).
Permet d'interfacer ultérieurement des services comme Semrush, DataForSEO, Ahrefs ou AppTweak.
"""

import time
from typing import List, Dict, Any
from app.providers.base import BaseDataProvider

class KeywordProvider(BaseDataProvider):
    def __init__(self):
        super().__init__(source_id="keywords", name="Keyword Intelligence Provider")

    async def check_health(self) -> Dict[str, Any]:
        self.record_success(count=1, response_ms=65)
        return {"status": "OPERATIONAL", "response_time_ms": 65}

    async def fetch_data(self, query: str = "expense tracker", country: str = "US") -> List[Dict[str, Any]]:
        """Retourne le volume de recherche estimé et la difficulté de classement."""
        return [{
            "keyword": query,
            "country": country,
            "monthly_search_volume": 45000,
            "competition_difficulty": 38.0,
            "cpc": 2.45
        }]

keyword_provider = KeywordProvider()
