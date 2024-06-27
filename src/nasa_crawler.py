import asyncio
import datetime
from itertools import chain
import json
import logging
import os

from dotenv import load_dotenv
from pymongo import MongoClient
from turbo_c2 import turbo, job, DynamicJobHelperApi

from json2graph.clients.nasa import Nasa


logging.basicConfig(level=logging.INFO)

neo4j_log = logging.getLogger("neo4j")
neo4j_log.setLevel(logging.DEBUG)

load_dotenv(".env", verbose=True)


@job(
    environ={
        "MONGODB_URL": os.environ["MONGODB_URL"],
        "MONGODB_COLLECTION": os.environ["MONGODB_COLLECTION"],
        "NASA_KEY": os.environ["NASA_KEY"],
    },
    replicas=1,
)
async def nasa_crawler(
    fself, on_first_run, environ: dict[str, str], api: DynamicJobHelperApi
):
    """
    This job writes data to a MongoDB collection.
    """

    @on_first_run()
    async def __on_first_run(
        fself, on_first_run, environ: dict[str, str], api: DynamicJobHelperApi
    ):
        fself["crawler"] = Nasa("https://api.nasa.gov")
        fself["endpoint"] = Nasa.AsteroidsNeoEndpoint
        fself["max_page"] = 10
        fself["page"] = 0
        fself["next_page"] = datetime.date(2023, 1, 1)
        fself["mongo_client"] = MongoClient(environ["MONGODB_URL"])

    await __on_first_run

    crawler: Nasa = fself["crawler"]
    mongo_client: MongoClient = fself["mongo_client"]
    next_page: datetime.date = fself["next_page"]

    result = await crawler.get_parsed_data(
        fself["endpoint"],
        params={
            "start_date": next_page.isoformat(),
            "detailed": "true",
            "api_key": environ["NASA_KEY"],
        },
    )
    items = list(result.get("near_earth_objects", {}).values())

    if items:
        flattened = []
        for x in chain(*items):
            x.pop("links")
            if x.get("sentry_data"):
                x.pop("sentry_data")

            flattened.append(x)

        with open("asteroids.json", "a") as f:
            for item in flattened:
                f.write(json.dumps(item))
                f.write("\n")

        collection = mongo_client["nasa"]["asteroids"]
        collection.insert_many(flattened)

    print("On page", fself["page"], fself["next_page"])
    fself["page"] += 1
    fself["next_page"] = fself["next_page"] + datetime.timedelta(days=7)

async def main():
    scheduler, central_api = await turbo.create()

    await scheduler.start()


if __name__ == "__main__":
    asyncio.run(main())
