from json2graph.clients.id_manager import IdManager
from json2graph.turbo.extra_apis.resources.id_manager_api import IdManagerApi
from turbo_c2 import actor, ActorDefinition

from json2graph.turbo.extra_apis.resources.json_to_graph_enum import JsonToGraphEnum


@actor(name="id_manager", api=IdManagerApi, api_identifier=JsonToGraphEnum.API_ID.value)
async def create_id_manager():
    return ActorDefinition(actor_class=IdManager)
