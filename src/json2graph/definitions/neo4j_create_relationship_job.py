import os
from json2graph.actors.create_id_manager import create_id_manager
from json2graph.events.neo4j_relationship_created import Neo4JRelationshipCreated
from json2graph.clients.neo4j_client import Neo4jClient
from json2graph.domain.neo4j_relationship_data import Neo4JRelationshipData
from turbo_c2 import job_definition, DynamicJobHelperApi, JobOutput

from json2graph.parameters.neo4j_create_relationship_parameters import Neo4jCreateRelationshipParameters


@job_definition(
    input_queue_reference="neo4j_create_relationship_queue",
    clients_with_context={
        "neo4j": Neo4jClient.from_url(
            os.environ["NEO4J_URL"],
            os.environ["NEO4J_USER"],
            os.environ["NEO4J_PASSWORD"],
        )
    },
    parameters=Neo4jCreateRelationshipParameters,
)
async def neo4j_create_relationship(
    fself,
    content: Neo4JRelationshipData,
    neo4j: Neo4jClient,
    api: DynamicJobHelperApi,
    on_first_run,
    parameters: Neo4jCreateRelationshipParameters,
):
    """
    This job creates a relationship in Neo4J.
    """

    @on_first_run()
    async def __on_first_run(
        fself,
        content: Neo4JRelationshipData,
        neo4j: Neo4jClient,
        api: DynamicJobHelperApi,
        on_first_run,
        parameters: Neo4jCreateRelationshipParameters,
    ):
        id_manager = await api.central_api.execute(
            (await create_id_manager(api.central_api)).resource_manager.get("default")
        )

        fself["id_manager"] = id_manager
        fself["j2g_create_relationship"] = await api.metrics_api.counter(
            "j2g_create_relationship",
            "Number of relationships created in Neo4J",
            labels={
                "job_instance": api.job_instance.resource_id,
                "migration_name": parameters.migration_name,
            },
        )

    await __on_first_run

    with api.buffer_context() as buffer:
        contents = []

        for b_content in [*buffer, content]:
            if isinstance(b_content, JobOutput):
                contents.append(b_content.content)
            elif not b_content is None:
                contents.append(b_content)

        neo4j.create_relationships(contents)
        await fself["j2g_create_relationship"].inc(len(contents))

        if parameters.dispatch_event:
            for c in contents:
                print("dispatching", c)
                yield Neo4JRelationshipCreated(
                    origin_id=c.origin_id,
                    origin_label=c.origin_label,
                    destination_id=c.destination_id,
                    destination_label=c.destination_label,
                    relationship_name=c.relationship_name,
                )
