from typing import Any
from neo4j import Driver, GraphDatabase

from json2graph.domain.neo4j_relationship_data import Neo4JRelationshipData
from json2graph.domain.node import Node
from json2graph.query_generator.neo4j.neo4j_query_generator import Neo4jQueryGenerator


class Neo4jClient():
    def __init__(self, driver: Driver | None = None, url: str | None = None, neo4j_user: str | None = None, neo4j_password: str | None = None) -> None:
        self.driver = driver
        self.query_generator = Neo4jQueryGenerator()
        self.__url = url
        self.__neo4j_user = neo4j_user
        self.__neo4j_password = neo4j_password

    def write_node(self, node: Node):
        with self.driver.session() as session:
            for (query, node_values) in self.query_generator.generate_create_query([node]):
                # print(query, node_values)
                session.run(query, nodes=node_values)

    def create_relationship(self, relationship_data: Neo4JRelationshipData):
        with self.driver.session() as session:
            query = self.query_generator.generate_query_for_relationship(relationship_data)
            session.run(query)

    def create_relationships(self, relationship_data: list[Neo4JRelationshipData]):
        with self.driver.session() as session:
            for query in self.query_generator.generate_query_for_relationships(relationship_data):
                session.run(query)

    def write_nodes(self, nodes: list[Node]):
        with self.driver.session() as session:
            for (query, nodes_values) in self.query_generator.generate_create_query(nodes):
                # print(query, nodes_values)
                session.run(query, nodes=nodes_values)

    def get_node_by_field(self, field: str, value: Any):
        with self.driver.session() as session:
            query = self.query_generator.generate_query_for_get_node_by_field(field, value)
            result = session.run(query)
            return result.data()
        
    def check_relationship_existence(
        self,
        source_field: str,
        source_value: str,
        destination_field: str,
        destination_value: str,
        relationship_name: str,
    ):
        with self.driver.session() as session:
            query = self.query_generator.generate_query_for_check_relationship_existence(
                source_field,
                source_value,
                destination_field,
                destination_value,
                relationship_name,
            )
            result = session.run(query)
            return result.data()

    def __enter__(self):
        if not self.driver:
            self.driver = GraphDatabase.driver(self.__url, auth=(self.__neo4j_user, self.__neo4j_password))
            self.driver.verify_connectivity()
        return self

    def __exit__(self, exc_type, exc_value, exc_traceback):
        self.driver.close()
        return
    
    @classmethod
    def from_url(cls, url: str, neo4j_user: str, neo4j_password: str):
        return cls(url=url, neo4j_user=neo4j_user, neo4j_password=neo4j_password)
