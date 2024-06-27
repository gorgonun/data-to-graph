import uuid
from json2graph.definitions.j2g_validator_create_random_data_job import (
    j2g_validator_create_random_data,
)
from json2graph.definitions.j2g_validator_validate_data_job import (
    j2g_validator_validate_data,
)
from json2graph.definitions.json_to_node_job import json_to_node
from json2graph.definitions.neo4j_create_relationship_job import (
    neo4j_create_relationship,
)
from json2graph.definitions.node_to_neo4j_job import node_to_neo4j
from json2graph.domain.create_new_validator_parameters import (
    CreateNewValidatorParameters,
)
from turbo_c2 import CentralApi

from json2graph.parameters.j2g_validator_create_random_data_parameters import (
    J2GValidatorCreateRandomDataParameters,
)
from json2graph.parameters.j2g_validator_validate_data_parameters import (
    J2GValidatorValidateDataParameters,
)
from json2graph.parameters.json_to_node_parameters import JsonToNodeParameters
from json2graph.parameters.neo4j_create_relationship_parameters import (
    Neo4jCreateRelationshipParameters,
)
from json2graph.parameters.node_to_neo4j_parameters import NodeToNeo4jParameters


async def create_new_random_validator(
    central_api: CentralApi, parameters: CreateNewValidatorParameters
):
    validator_uuid = uuid.uuid4().hex

    data_destination_queue = f"j2g_validator_validate_data_{validator_uuid}"

    get_name = lambda definition_name: f"{definition_name}_{validator_uuid}"

    migration_name = f"Random Data Validator {validator_uuid}"

    neo4j_node_created_event_destination_queue = (
        f"json_to_node_output_{uuid.uuid4().hex}"
    )

    j2g_validator_create_random_data_result = await (
        j2g_validator_create_random_data.set(
            instance_parameters=J2GValidatorCreateRandomDataParameters(
                data_destination_queue=data_destination_queue,
                neo4j_url=parameters.neo4j_url,
                neo4j_user=parameters.neo4j_user,
                neo4j_password=parameters.neo4j_password,
                generate_models_size=parameters.generate_models_size,
                deep_nested_model_kwargs=parameters.deep_nested_model_kwargs,
                default_deep_nested_model_kwargs=parameters.default_deep_nested_model_kwargs,
                models=parameters.models,
            ),
            name=get_name(j2g_validator_create_random_data.definition.name),
        )
        .then(
            json_to_node,
            instance_parameters=JsonToNodeParameters(
                root_table=get_name("j2g_validator"),
                event_data_destination_queue=neo4j_node_created_event_destination_queue,
            ),
            name=get_name(json_to_node.definition.name),
        )
        .then(
            node_to_neo4j,
            instance_parameters=NodeToNeo4jParameters(migration_name=migration_name),
            name=get_name(node_to_neo4j.definition.name),
        )
        .evaluate_instances()
        .remote_register(central_api)
    )

    j2g_validator_validate_data_result = await (
        j2g_validator_validate_data.set(
            input_queue_reference=data_destination_queue,
            instance_parameters=J2GValidatorValidateDataParameters(
                data_destination_queue=data_destination_queue,
                neo4j_url=parameters.neo4j_url,
                neo4j_user=parameters.neo4j_user,
                neo4j_password=parameters.neo4j_password,
            ),
            name=get_name(j2g_validator_validate_data.definition.name),
        )
        .evaluate_instances()
        .remote_register(central_api)
    )

    relations_result = (
        await neo4j_create_relationship.set(
            input_queue_reference=neo4j_node_created_event_destination_queue,
            instance_parameters=Neo4jCreateRelationshipParameters(
                migration_name=migration_name,
                dispatch_event=True,
            ),
            name=get_name(neo4j_create_relationship.definition.name),
        )
        .evaluate_instances()
        .remote_register(central_api)
    )

    return [
        j2g_validator_create_random_data_result,
        j2g_validator_validate_data_result,
        relations_result,
    ]
