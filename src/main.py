import asyncio
import logging
import os

from turbo_c2 import turbo

from json2graph.turbo.extra_apis.commands.migration_creator_definition import (
    MigrationCreatorDefinition,
)
from json2graph.turbo.extra_apis.json_to_graph_apis.json_to_graph_extra_api import (
    JsonToGraphExtraApi,
)
from json2graph.turbo.extra_apis.resources.migration_creator import MigrationCreator

from turbo_c2 import ExternalApi, extra_api, config
from turbo_c2.turbo_events import TurboEventsScheduler
from turbo_c2.domain.scheduler.config import Config

from json2graph.definitions import *
from json2graph.json2graph_deployment import *

logging.basicConfig(level=logging.INFO)

neo4j_log = logging.getLogger("neo4j")
neo4j_log.setLevel(logging.DEBUG)


@config()
def main_config(default_config: Config):
    default_config.serve_host = "0.0.0.0"
    default_config.cors_origins = ["http://localhost", "http://localhost:80"]
    return default_config


@extra_api()
def custom_extra_api(central_api: CentralApi, mapping: dict[str, ExternalApi]):
    async def after_creation(central_api: CentralApi):
        await central_api.execute(
            MigrationCreatorDefinition.set(MigrationCreator(), "default")
        )

    return JsonToGraphExtraApi(central_api), after_creation


async def main():
    scheduler, _ = await turbo.create(TurboEventsScheduler(), environment_variables={
        "MONGODB_URL": os.environ["MONGODB_URL"],
        "MONGODB_COLLECTION": os.environ["MONGODB_COLLECTION"],
        "MONGODB_DATABASE": os.environ["MONGODB_DATABASE"],
        "NEO4J_URL": os.environ["NEO4J_URL"],
        "NEO4J_USER": os.environ["NEO4J_USER"],
        "NEO4J_PASSWORD": os.environ["NEO4J_PASSWORD"],
        "PROMETHEUS_HOST": os.environ["PROMETHEUS_HOST"],
    })

    await scheduler.start()


if __name__ == "__main__":
    asyncio.run(main())
