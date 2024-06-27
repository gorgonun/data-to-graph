import asyncio
from collections import deque
import time
import uuid
from typing import Any, Coroutine

from turbo_c2 import DynamicJobHelperApi, job_definition, JobOutput
from turbo_c2.turbo_events import (HandlerAfterExecutionPropertyEnum,
                                   HandlerProperties, event_happened, when, HandlerController)
from turbo_c2.turbo_events.commands import RegisterHandlersCommand

from json2graph.actors.create_id_manager import create_id_manager
from json2graph.actors.create_schema_api import create_schema_api
from json2graph.domain.async_relationship_reference import AsyncRelationshipReference
from json2graph.events.neo4j_node_created import Neo4JNodeCreated
from json2graph.json_to_node import JsonToNode
from json2graph.domain.neo4j_relationship_data import Neo4JRelationshipData
from json2graph.domain.node import PartialNode
from json2graph.domain.node_feedback import NodeFeedback
from json2graph.parameters.json_to_node_parameters import JsonToNodeParameters


def handler(origin_id, origin_label, destination_processing_id, relationship_name, event_data_destination_queue):
    def trigger(origin_id: str, origin_label: str, destination_processing_id: str, relationship_name: str):
        def wrapper(last_event: Neo4JNodeCreated, events: list[Neo4JNodeCreated]):
            if len(events) != 2:
                raise RuntimeError("Expected two events")

            if destination_processing_id == last_event.processing_id:

                return Neo4JRelationshipData(
                    origin_id=origin_id,
                    origin_label=origin_label,
                    destination_id=last_event.id,
                    destination_label=last_event.label,
                    relationship_name=relationship_name,
                )

        return wrapper

    relationship_handler = when(
        predicate=(
            event_happened(Neo4JNodeCreated.ref(id=origin_id))
            & event_happened(
                Neo4JNodeCreated.ref(processing_id=destination_processing_id)
            )
        ),
        outputs=[event_data_destination_queue],
        handler_properties=HandlerProperties(
            after_true=HandlerAfterExecutionPropertyEnum.DELETE
        ),
    )(trigger(origin_id, origin_label, destination_processing_id, relationship_name))

    return relationship_handler


async def on_subnode(
    client: JsonToNode, api: DynamicJobHelperApi, event_data_destination_queue: str, handler_accumulator: list[HandlerController]
):
    async def with_client_and_queue(
        node: PartialNode, src_column: str, level: int, sub_node: dict[str, Any]
    ):
        reference = AsyncRelationshipReference(uuid.uuid4().hex)

        relationship_handler = handler(
            node.id, node.table.name, str(reference), src_column, event_data_destination_queue
        )

        # print("Registered handlers", node.id, str(reference), src_column, event_data_destination_queue)

        handler_accumulator.append(relationship_handler)

        node.relations.append(reference)

        # before_send = time.perf_counter()
        await api.send_to_self(
            NodeFeedback(
                data=sub_node,
                processing_id=reference,
                level=level + 1,
                parent_field=src_column,
            )
        )

        # print(f"Send time: {time.perf_counter() - before_send}")
        return reference

    return with_client_and_queue


# Exclusive queue for feedback to decreate the size of handlers
@job_definition(
    input_queue_reference="mongodb_producer_output",
    output_queues_references=["json_to_node_output"],
    parameters=JsonToNodeParameters,
)
async def json_to_node(
    fself,
    content: dict[str, Any] | NodeFeedback,
    api: DynamicJobHelperApi,
    parameters: JsonToNodeParameters,
    on_first_run,
):
    """
    This job converts JSON data to nodes.
    """

    @on_first_run()
    async def __on_first_run(
        fself,
        content: dict[str, Any] | NodeFeedback,
        api: DynamicJobHelperApi,
        parameters: JsonToNodeParameters,
        on_first_run,
    ):
        schema_api = await api.central_api.execute(
            (await create_schema_api(api.central_api)).resource_manager.get("default")
        )

        if not schema_api:
            raise RuntimeError("Schema API not found")

        id_manager = await api.central_api.execute(
            (await create_id_manager(api.central_api)).resource_manager.get("default")
        )

        if not id_manager:
            raise RuntimeError("Id Manager not found")

        fself["client"] = JsonToNode(parameters.root_table, schema_api, id_manager)

    await __on_first_run

    client: JsonToNode = fself["client"]

    with api.buffer_context() as buffer:
        contents = []
        content_to_process = deque([*buffer, content])

        while content_to_process:
            for _ in range(len(content_to_process)):
                job_content = content_to_process.popleft()

                if isinstance(job_content, NodeFeedback):
                    contents.append(job_content)
                elif isinstance(job_content, JobOutput):
                    content_to_process.append(job_content.content)
                elif isinstance(job_content, dict):
                    contents.append(NodeFeedback(data=job_content, level=0, processing_id=None, parent_field=None))
                else:
                    raise RuntimeError("Unexpected content", content)

        handler_accumulator = []

        # before_migrate = time.perf_counter()
        # print(f"Contents: {len(contents)}", contents)
        nodes = await client.migrate_data(
                contents,
                on_subnode=await on_subnode(client, api, parameters.event_data_destination_queue, handler_accumulator),
            )
        
        # if len(nodes) != len(buffer) + 1:
        #     print(f"Nodes: {len(nodes)}", nodes, f"Buffer: {len(buffer)}", buffer, content)
        #     raise RuntimeError("Nodes not created")
        
        # print(f"Migrate time: {time.perf_counter() - before_migrate}")

        # before_register = time.perf_counter()
        await api.central_api.execute(RegisterHandlersCommand(handler_accumulator))
        # print(f"Register time: {time.perf_counter() - before_register}")

    return nodes
