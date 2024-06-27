from turbo_c2 import actor, ActorDefinition

from json2graph.clients.schema_api import SchemaAPI
from json2graph.turbo.extra_apis.resources.json_to_graph_enum import JsonToGraphEnum
from json2graph.turbo.extra_apis.resources.remote_schema_api_api import (
    RemoteSchemaApiApi,
)


@actor(
    name="schema_api",
    api=RemoteSchemaApiApi,
    api_identifier=JsonToGraphEnum.API_ID.value,
)
async def create_schema_api():
    return ActorDefinition(
        actor_class=SchemaAPI, kwargs={"max_difference_between_schemas": 0.2}
    )
