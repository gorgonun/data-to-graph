from __future__ import annotations
from dataclasses import dataclass

from json2graph.domain.schema import Schema


@dataclass
class Table:
    id: int
    name: str
    schema: Schema
