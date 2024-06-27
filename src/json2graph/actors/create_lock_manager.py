from json2graph.clients.lock_manager import LockManager
from turbo_c2 import actor, ActorDefinition

from json2graph.turbo.extra_apis.resources.json_to_graph_enum import JsonToGraphEnum
from json2graph.turbo.extra_apis.resources.lock_manager_api import LockManagerApi


@actor(name="lock_manager", api=LockManagerApi, api_identifier=JsonToGraphEnum.API_ID.value)
async def create_lock_manager():
    return ActorDefinition(actor_class=LockManager)
