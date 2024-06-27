from json2graph.domain.neo4j_relationship_data import Neo4JRelationshipData
from json2graph.domain.node import Node
from json2graph.query_generator.neo4j.node_query_generator import NodeQueryGenerator


class Neo4jQueryGenerator:
    def __init__(self, node_query_generator: NodeQueryGenerator | None = None) -> None:
        self.node_query_generator = node_query_generator or NodeQueryGenerator()

    def generate_create_query(self, nodes: list[Node]):
        yield from self.node_query_generator.generate_create_query(nodes)

    def generate_query_for_relationship(self, relationship_data: Neo4JRelationshipData):
        return self.node_query_generator.generate_query_for_relationship(
            relationship_data
        )
    
    def generate_query_for_relationships(self, relationship_data: list[Neo4JRelationshipData]):
        return self.node_query_generator.generate_query_for_relationships(
            relationship_data
        )

    def generate_query_for_get_node_by_field(self, field: str, value: str):
        return self.node_query_generator.generate_query_for_get_node_by_field(
            field, value
        )

    def generate_query_for_check_relationship_existence(
        self,
        source_field: str,
        source_value: str,
        destination_field: str,
        destination_value: str,
        relationship_name: str,
    ):
        return (
            self.node_query_generator.generate_query_for_check_relationship_existence(
                source_field,
                source_value,
                destination_field,
                destination_value,
                relationship_name,
            )
        )
