import os
from json2graph.actors.create_id_manager import create_id_manager
from json2graph.events.neo4j_node_created import Neo4JNodeCreated
from json2graph.clients.neo4j_client import Neo4jClient
from json2graph.domain.neo4j_relationship_data import Neo4JRelationshipData
from json2graph.domain.node import Node
from turbo_c2 import DynamicJobHelperApi, job_definition

from json2graph.parameters.node_to_neo4j_parameters import NodeToNeo4jParameters


@job_definition(
    input_queue_reference="json_to_node_output",
    clients_with_context={
        "neo4j": Neo4jClient.from_url(
            os.environ["NEO4J_URL"],
            os.environ["NEO4J_USER"],
            os.environ["NEO4J_PASSWORD"],
        )
    },
    meta={"dispatches": [Neo4JNodeCreated]},
    parameters=NodeToNeo4jParameters,
)
async def node_to_neo4j(
    fself,
    content: Node,
    neo4j: Neo4jClient,
    on_first_run,
    api: DynamicJobHelperApi,
    parameters: NodeToNeo4jParameters,
):
    """
    This job writes a node to Neo4J.
    """

    @on_first_run()
    async def __on_first_run(
        fself,
        content: Node,
        neo4j: Neo4jClient,
        api: DynamicJobHelperApi,
        on_first_run,
        parameters: NodeToNeo4jParameters,
    ):
        id_manager = await api.central_api.execute(
            (await create_id_manager(api.central_api)).resource_manager.get("default")
        )

        fself["id_manager"] = id_manager
        fself["j2g_write_data"] = await api.metrics_api.counter(
            "j2g_write_data",
            "Number of data written to Neo4J",
            labels={
                "job_instance": api.job_instance.resource_id,
                "migration_name": parameters.migration_name,
            },
        )

    await __on_first_run

    results = []

    with api.buffer_context() as buffer:
        contents = [*[x.content for x in buffer], content]
        # print("conteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeents", contents)
        neo4j.write_nodes(contents)
        await fself["j2g_write_data"].inc(len(contents))

        for wrote_content in contents:
            result = Neo4JNodeCreated(
                id=wrote_content.id, label=wrote_content.table.name, processing_id=wrote_content.processing_id
            )

            results.append(result)
    # print(results)
    return results
