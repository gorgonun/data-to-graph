from asyncio import Lock


class LockManager():
    def __init__(self, meta: dict[str, str] | None) -> None:
        self.__lock = Lock()
        self.__meta = meta

    async def acquire(self):
        await self.__lock.acquire()

    def release(self):
        self.__lock.release()

    def is_locked(self) -> bool:
        return self.__lock.locked()
    
    async def wait_unlock(self):
        await self.__lock.acquire()
        self.__lock.release()
