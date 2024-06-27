from json2graph.clients.id_manager import IdManager


class IdManagerApi():
    def __init__(self, actor_ref: IdManager):
        self.actor_ref = actor_ref

    async def get_id_increment(self, name: str, create: bool = False) -> int | None:
        return await self.actor_ref.get_id_increment.remote(name, create)
    
    async def get_next_increments(self, name: str, count: int, create: bool = False) -> list[int]:
        return await self.actor_ref.get_next_increments.remote(name, count, create)
