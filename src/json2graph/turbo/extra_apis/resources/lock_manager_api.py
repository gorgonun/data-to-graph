from json2graph.clients.lock_manager import LockManager


class LockManagerApi():
    def __init__(self, actor_ref: LockManager):
        self.actor_ref = actor_ref

    async def acquire(self):
        return await self.actor_ref.acquire.remote()
    
    async def release(self):
        return await self.actor_ref.release.remote()
    
    async def is_locked(self) -> bool:
        return await self.actor_ref.is_locked.remote()

    async def wait_unlock(self):
        return await self.actor_ref.wait_unlock.remote()
