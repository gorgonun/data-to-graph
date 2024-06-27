import asyncio
import logging
import os

from dotenv import load_dotenv
from turbo_c2 import turbo

from json2graph.domain.create_new_validator_parameters import (
    CreateNewValidatorParameters,
)
from json2graph.helpers.create_new_random_validator import create_new_random_validator
from json2graph.turbo.extra_apis.commands.migration_creator_definition import (
    MigrationCreatorDefinition,
)
from json2graph.turbo.extra_apis.json_to_graph_apis.json_to_graph_extra_api import (
    JsonToGraphExtraApi,
)
from json2graph.turbo.extra_apis.resources.migration_creator import MigrationCreator

load_dotenv("../.env", verbose=True)
from turbo_c2 import ExternalApi, extra_api
from turbo_c2.turbo_events import TurboEventsScheduler, consumer_settings

from json2graph.definitions import *
from json2graph.json2graph_deployment import *

logging.basicConfig(level=logging.INFO)

neo4j_log = logging.getLogger("neo4j")
neo4j_log.setLevel(logging.DEBUG)


@consumer_settings()
def custom_consumer_settings():
    return {
        "replicas": 2,
    }


@extra_api()
def custom_extra_api(central_api: CentralApi, mapping: dict[str, ExternalApi]):
    async def after_creation(central_api: CentralApi):
        await central_api.execute(
            MigrationCreatorDefinition.set(MigrationCreator(), "default")
        )

    return JsonToGraphExtraApi(central_api), after_creation


async def main():
    scheduler, central_api = await turbo.create(TurboEventsScheduler(), environment_variables={
        "MONGODB_URL": os.environ["MONGODB_URL"],
        "MONGODB_COLLECTION": os.environ["MONGODB_COLLECTION"],
        "MONGODB_DATABASE": os.environ["MONGODB_DATABASE"],
        "NEO4J_URL": os.environ["NEO4J_URL"],
        "NEO4J_USER": os.environ["NEO4J_USER"],
        "NEO4J_PASSWORD": os.environ["NEO4J_PASSWORD"],
        "PROMETHEUS_HOST": os.environ["PROMETHEUS_HOST"],
        "CUSTOM_HOST": os.environ["CUSTOM_HOST"],
    })

    await create_new_random_validator(
        central_api,
        CreateNewValidatorParameters(
            neo4j_url=os.environ["NEO4J_URL"],
            neo4j_user=os.environ["NEO4J_USER"],
            neo4j_password=os.environ["NEO4J_PASSWORD"],
        ),
    )

    await scheduler.start()


if __name__ == "__main__":
    asyncio.run(main())
