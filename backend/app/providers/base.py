"""
Architecture d'abstraction DataProvider (Cahier des charges #3 & #4).
Permet de remplacer ou ajouter des sources de données de manière totalement modulaire
sans impacter le reste du backend.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class BaseDataProvider(ABC):
    def __init__(self, source_id: str, name: str):
        self.source_id = source_id
        self.name = name
        self.last_sync: Optional[datetime] = None
        self.last_error: Optional[str] = None
        self.records_count: int = 0
        self.response_time_ms: int = 0
        self.is_operational: bool = True

    @abstractmethod
    async def fetch_data(self, **kwargs) -> List[Dict[str, Any]]:
        """Collecte les données de la source avec gestion d'erreurs et timeouts."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Vérifie la disponibilité et le temps de réponse de la source."""
        pass

    def record_success(self, count: int, response_ms: int):
        self.last_sync = datetime.now(timezone.utc)
        self.records_count += count
        self.response_time_ms = response_ms
        self.is_operational = True
        self.last_error = None

    def record_failure(self, error: str):
        self.last_sync = datetime.now(timezone.utc)
        self.last_error = error
        self.is_operational = False
