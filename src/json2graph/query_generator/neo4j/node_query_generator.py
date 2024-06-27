from typing import Any
from json2graph.domain.neo4j_relationship_data import Neo4JRelationshipData
from json2graph.domain.node import Node


class NodeQueryGenerator:
    def merge_nodes_by_label(self, nodes: list[Node]):
        labels = {}
        for node in nodes:
            labels.setdefault(node.table.name, []).append(node)

        return labels

    def generate_create_query(self, nodes: list[Node]):
        nodes_by_label = self.merge_nodes_by_label(nodes)

        for label, nodes in nodes_by_label.items():
            yield self.generate_query_for_label(label, nodes)

    def generate_query_for_label(self, label: str, nodes: list[Node]):
        row_query = self.generate_query_for_row(nodes[0])

        return (
            f"""
            WITH $nodes AS nodes
            UNWIND nodes AS node
            MERGE (n:{self.scape_label(label)} {{__jtg_id: node.id}})
            ON CREATE\n {row_query}
            """,
            [
                {"id": node.id, **node.common_values}
                for node in nodes
            ],
        )

    def generate_query_for_row(self, node: Node) -> str:
        result = []

        for column in node.table.schema.column_information.values():
            if not column.is_relationship:
                result.append(f"n.{self.scape_label(column.name)} = node.{column.name}")

        result.append("n.__jtg_id = node.id")

        return "SET " + ",\n".join([*result])

    def generate_query_for_relationship(
        self, relationship_data: Neo4JRelationshipData
    ) -> str:
        return f"""
            MATCH (n :{relationship_data.origin_label} {{__jtg_id: {relationship_data.origin_id}}})
            MATCH (n1 :{relationship_data.destination_label} {{__jtg_id: {relationship_data.destination_id}}})
            MERGE (n)-[:{self.scape_label(relationship_data.relationship_name)}]->(n1)
        """
    
    def generate_query_for_relationships(
        self, relationship_data: list[Neo4JRelationshipData]
    ) -> list[str]:
        return [
            self.generate_query_for_relationship(data)
            for data in relationship_data
        ]

    def generate_query_for_get_node_by_field(self, field: str, value: Any) -> str:
        quote_if_str = lambda x: f'"{x}"' if isinstance(x, str) else x

        return f"""
            MATCH (n {{{self.scape_label(field)}: {quote_if_str(value)}}})
            RETURN n
        """

    def generate_query_for_check_relationship_existence(
        self,
        source_field: str,
        source_value: str,
        destination_field: str,
        destination_value: str,
        relationship_name: str,
    ):
        return f"""
            RETURN exists( ( {{{source_field}: {source_value}}})-[:{relationship_name}]-({{{destination_field}: {destination_value}}}) )
        """

    def scape_label(self, label: str) -> str:
        # convert \u0060 to literal backtick and then escape backticks
        return label.replace("\\u0060", "`").replace("`", "``")
