from __future__ import annotations
from dataclasses import dataclass, field
import json
from typing import Any

from json2graph.domain.table import Table


@dataclass
class Node():
    id: int
    table: Table
    common_values: dict[str, Any] = field(default_factory=lambda: {})
    relationship_references: dict[str, Any] = field(default_factory=lambda: {})
    relations: list[Node] = field(default_factory=lambda: [])
    processing_id: str | None = None

    @property
    def values(self):
        return {**self.common_values, **self.relationship_references}
    
    @property
    def node_hash(self):
        return hash(json.dumps(self.common_values, sort_keys=True))


@dataclass
class PartialNode():
    id: int
    table: Table
    relations: list[Node] = field(default_factory=lambda: [])
