from typing import Any
from turbo_c2 import job_definition, DynamicJobHelperApi, JobOutput, JobContentParameter
from turbo_c2.commands import JsonResource, MemoryResource
from turbo_c2.turbo_events import when, event_happened, HandlerProperties, HandlerAfterExecutionPropertyEnum
from turbo_c2.turbo_events.commands import DispatchEventCommand, RegisterHandlerCommand

from json2graph.definitions.node_to_neo4j_job import node_to_neo4j
from json2graph.events.j2g_validator_neo4j_node_created import (
    J2GValidatorNeo4JNodeCreated,
)
from json2graph.events.neo4j_node_created import Neo4JNodeCreated
from json2graph.events.neo4j_relationship_created import Neo4JRelationshipCreated
from json2graph.clients.neo4j_client import Neo4jClient
from json2graph.domain.node import Node
from json2graph.parameters.j2g_validator_create_random_data_parameters import J2GValidatorCreateRandomDataParameters
from json2graph.validator.j2g_validator_model import J2GValidator
from json2graph.validator.model_creators.create_random_deep_nested_model import (
    CreateRandomDeepNestedModel,
)


def get_trigger_validator_with_event_handler(data_uuid: str, output_queue: str):
    @when(
        predicate=event_happened(J2GValidatorNeo4JNodeCreated.ref(data_uuid=data_uuid)),
        outputs=[output_queue],
        handler_properties=HandlerProperties(
            after_true=HandlerAfterExecutionPropertyEnum.DELETE
        ),
    )
    def trigger_validator_with_event_handler(last_event: J2GValidatorNeo4JNodeCreated, events: list[J2GValidatorNeo4JNodeCreated]):
        return last_event

    return trigger_validator_with_event_handler


def get_trigger_validator_with_event_handler_for_relationship(output_queue: str):
    @when(
        predicate=event_happened(
                Neo4JRelationshipCreated.ref()
            ),
        outputs=[output_queue],
    )
    def trigger_validator_with_event_handler(last_event: Neo4JRelationshipCreated, events: list[Neo4JRelationshipCreated]):
        return last_event

    return trigger_validator_with_event_handler


@job_definition(
    output_queues_references=["json_to_node_output"],
    parameters=J2GValidatorCreateRandomDataParameters,
    iterable_chunk_size=1,
    wait_time=10
)
async def j2g_validator_create_random_data(
    fself,
    api: DynamicJobHelperApi,
    parameters: J2GValidatorCreateRandomDataParameters,
    on_first_run,
):
    """
    This job generate random model and data for the J2GValidator
    """

    async def send_event_after_neo4j_write(job_input: JobOutput[dict[str, Any], Node], _: Neo4JNodeCreated, api: DynamicJobHelperApi):
        if api.job_instance.job_definition.name == node_to_neo4j.definition.name:
            await api.central_api.execute(
                DispatchEventCommand(
                    J2GValidatorNeo4JNodeCreated(
                        data_uuid=job_input.content.common_values.get("data_uuid"), node_id=job_input.content.id
                    )
                )
            )

    @on_first_run()
    async def __on_first_run(
        fself,
        api: DynamicJobHelperApi,
        parameters: J2GValidatorCreateRandomDataParameters,
        on_first_run,
    ):
        models = parameters.models
        if not models:

            deep_nested_model_kwargs = parameters.deep_nested_model_kwargs
            new_models_size = parameters.generate_models_size or 1

            if len(deep_nested_model_kwargs) < new_models_size:
                deep_nested_model_kwargs += [
                    parameters.default_deep_nested_model_kwargs
                    for _ in range(new_models_size - len(deep_nested_model_kwargs))
                ]
            models = [
                CreateRandomDeepNestedModel(**kwargs).new_model()
                for kwargs in deep_nested_model_kwargs
            ]

        fself["models"] = models
        fself["validator"] = J2GValidator(
            Neo4jClient.from_url(
                parameters.neo4j_url,
                parameters.neo4j_user,
                parameters.neo4j_password,
            )
        )

        await api.central_api.execute(
            RegisterHandlerCommand(
                get_trigger_validator_with_event_handler_for_relationship(
                    parameters.data_destination_queue
                )
            )
        )

    await __on_first_run

    for model in fself["models"]:
        data = J2GValidator.generate_random_data(model)

        for datum in data.get_all_models():
            dumped_data = datum.model_dump(mode="json")

            await api.central_api.execute(
                    RegisterHandlerCommand(
                        get_trigger_validator_with_event_handler(
                            str(datum.data_uuid), parameters.data_destination_queue
                        )
                    )
                )

            try:
                await api.central_api.execute(JsonResource.create(dumped_data, str(datum.data_uuid)))

                await api.central_api.execute(MemoryResource.create(type(datum), str(datum.data_uuid)))

            except Exception as e:
                print(f"Error creating data: {e}. Data: {dumped_data}")

        yield JobOutput(
                data.model_dump(mode="json"),
                job_content_parameters=[
                    JobContentParameter(
                        after_send_to_output=send_event_after_neo4j_write
                    )
                ],
            )
