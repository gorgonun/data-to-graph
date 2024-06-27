from dataclasses import dataclass

from json2graph.domain.async_relationship_reference import AsyncRelationshipReference


@dataclass
class NodeFeedback:
    data: dict
    level: int
    processing_id: AsyncRelationshipReference | None
    parent_field: str
