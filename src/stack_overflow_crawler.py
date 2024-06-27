import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from pymongo import MongoClient
from turbo_c2 import turbo, job, DynamicJobHelperApi

from json2graph.actors.create_lock_manager import create_lock_manager
from json2graph.clients.stack_overflow import StackOverflow

from json2graph.actors.create_id_manager import create_id_manager
from json2graph.turbo.extra_apis.resources.lock_manager_api import LockManagerApi

logging.basicConfig(level=logging.INFO)

neo4j_log = logging.getLogger("neo4j")
neo4j_log.setLevel(logging.DEBUG)

load_dotenv(".env", verbose=True)


@job(
    environ={
        "MONGODB_URL": os.environ["MONGODB_URL"],
        "MONGODB_COLLECTION": os.environ["MONGODB_COLLECTION"],
        "STACK_OVERFLOW_KEY": os.environ["STACK_OVERFLOW_KEY"],
    },
    replicas=2,
)
async def stack_overflow_crawler(
    fself, on_first_run, environ: dict[str, str], api: DynamicJobHelperApi
):
    """
    This job writes data to a MongoDB collection.
    """

    @on_first_run()
    async def __on_first_run(
        fself, on_first_run, environ: dict[str, str], api: DynamicJobHelperApi
    ):
        fself["crawler"] = StackOverflow("https://api.stackexchange.com")
        fself["endpoint"] = StackOverflow.QuestionsEndpoint
        fself["max_page"] = 1000
        fself["mongo_client"] = MongoClient(environ["MONGODB_URL"])
        fself["id_manager"] = await api.central_api.execute(
            (await create_id_manager(api.central_api)).resource_manager.get("default")
        )
        fself["id_manager_key"] = "stack_overflow_questions"
        fself["lock_manager"] = await api.central_api.execute(
            (await create_lock_manager(api.central_api)).resource_manager.get("default")
        )

    await __on_first_run

    fself["page"] = await fself["id_manager"].get_id_increment(
        fself["id_manager_key"], create=True
    )
    if fself["page"] > fself["max_page"]:
        raise RuntimeError("Max page reached")

    crawler: StackOverflow = fself["crawler"]
    mongo_client: MongoClient = fself["mongo_client"]
    lock_manager: LockManagerApi = fself["lock_manager"]

    if await lock_manager.is_locked():
        print("Waiting for unlock")
        await lock_manager.wait_unlock()
        print("Unlocked")

    await lock_manager.acquire()

    result = await crawler.get_parsed_data(
        fself["endpoint"],
        params={
            "pagesize": 100,
            "page": fself["page"],
            "order": "desc",
            "sort": "creation",
            "site": "stackoverflow",
            "key": environ["STACK_OVERFLOW_KEY"],
            "filter": "!)PUbM21nlmVsKQn)VJv(m(gukySm2mG7E9XvG31kIxm*XOh)o2p9.cAVJKKbvakZcDjFI1",
        },
    )
    
    print("Got page", fself["page"])
    backoff_time = result.get("backoff")

    if backoff_time:
        print("Backoff time", backoff_time)
        await asyncio.sleep(backoff_time)

    await lock_manager.release()

    items = result.get("items", [])

    if items:
        with open(f"mongo-seed/stackoverflow/questions-{fself['page']}.json", "w") as f:
            json.dump(items, f)

        collection = mongo_client["stackoverflow"]["questions"]
        collection.insert_many(items)

async def main():
    scheduler, central_api = await turbo.create()

    await scheduler.start()


if __name__ == "__main__":
    asyncio.run(main())
