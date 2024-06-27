import uuid
from json2graph.domain.create_new_migration_parameters import CreateNewMigrationParameters
from json2graph.domain.migration_type_enum import MigrationType
from json2graph.definitions.mongo_db_listener_job import mongo_db_listener
from json2graph.definitions.json_to_node_job import json_to_node
from json2graph.definitions.mongodb_producer_job import mongodb_producer
from json2graph.definitions.neo4j_create_relationship_job import (
    neo4j_create_relationship,
)
from json2graph.definitions.node_to_neo4j_job import node_to_neo4j
from turbo_c2 import CentralApi

from json2graph.parameters.json_to_node_parameters import JsonToNodeParameters
from json2graph.parameters.mongo_db_producer_parameters import MongoDbProducerParameters
from json2graph.parameters.neo4j_create_relationship_parameters import Neo4jCreateRelationshipParameters
from json2graph.parameters.node_to_neo4j_parameters import NodeToNeo4jParameters


async def create_new_migration(
    central_api: CentralApi, parameters: CreateNewMigrationParameters
):
    neo4j_node_created_event_destination_queue = (
        f"json_to_node_output_{uuid.uuid4().hex}"
    )

    get_name = lambda definition_name: f"{definition_name}_{parameters.migration_name}"

    producer_by_type = {
        MigrationType.ONE_TIME: mongodb_producer.set(
            replicas=parameters.mongodb_producer_replicas,
            instance_parameters=MongoDbProducerParameters(
                mongodb_url=parameters.mongodb_url,
                mongodb_database=parameters.mongodb_database,
                mongodb_collection=parameters.mongodb_collection,
                mongodb_producer_limit=parameters.mongodb_producer_limit,
            ),
            name=get_name(mongodb_producer.definition.name),
            scheduling_strategy="DEFAULT",
        ),
        MigrationType.CONTINUOUS: mongo_db_listener.set(
            replicas=parameters.mongodb_producer_replicas,
            instance_parameters=MongoDbProducerParameters(
                mongodb_url=parameters.mongodb_url,
                mongodb_database=parameters.mongodb_database,
                mongodb_collection=parameters.mongodb_collection,
            ),
            name=get_name(mongo_db_listener.definition.name),
        ),
    }

    node_result = await (
        producer_by_type[parameters.migration_type]
        .then(
            json_to_node,
            instance_parameters=JsonToNodeParameters(
                root_table=parameters.root_database_name
                or parameters.mongodb_collection,
                event_data_destination_queue=neo4j_node_created_event_destination_queue,
            ),
            replicas=parameters.json_to_node_replicas,
            name=get_name(json_to_node.definition.name),
        )
        .then(
            node_to_neo4j,
            instance_parameters=NodeToNeo4jParameters(
                migration_name=parameters.migration_name
            ),
            replicas=parameters.node_to_neo4j_replicas,
            name=get_name(node_to_neo4j.definition.name),
        )
        .evaluate_instances()
        .remote_register(central_api)
    )

    relations_result = await neo4j_create_relationship.set(
        input_queue_reference=neo4j_node_created_event_destination_queue,
        replicas=parameters.neo4j_create_relationship_replicas,
        instance_parameters=Neo4jCreateRelationshipParameters(migration_name=parameters.migration_name, dispatch_event=False),
        name=get_name(neo4j_create_relationship.definition.name),
    ).evaluate_instances().remote_register(central_api)

    return [node_result, relations_result]
