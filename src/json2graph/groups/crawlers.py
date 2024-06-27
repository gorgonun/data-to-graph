import asyncio
import os
from typing import Any, Callable, Coroutine
from turbo_c2 import job
from pymongo import MongoClient

from json2graph.clients.portal_da_transparencia import PortalDaTransparencia
from json2graph.parameters.mongo_db_producer_parameters import MongoDbProducerParameters


async def iterate_over_pages(
    f: Callable[[int], Coroutine[Any, Any, list[dict[str, Any]]]]
):
    page = 1
    while True:
        data: list[dict[str, Any]] = await f(page)

        if len(data) == 0:
            break

        for item in data:
            yield item

        page += 1
        await asyncio.sleep(1)


@job(
    group_path="crawlers",
    portal_da_transparencia_client=PortalDaTransparencia(
        base_url="https://api.portaldatransparencia.gov.br/api-de-dados",
        api_key=os.environ["PORTAL_DA_TRANSPARENCIA_API_KEY"],
    ),
    single_run=True,
    output_queues_references=["government_agencies_output"],
)
async def crawl_government_agencies(
    portal_da_transparencia_client: PortalDaTransparencia,
):
    """
    This job crawls the web.
    """
    government_agencies_endpoint = (
        portal_da_transparencia_client.ServidoresPorOrgaoEndpoint
    )

    async for item in iterate_over_pages(
        lambda page: portal_da_transparencia_client.get_parsed_data(
            government_agencies_endpoint, params={"pagina": page}
        )
    ):
        yield item


@job(
    group_path="crawlers",
    portal_da_transparencia_client=PortalDaTransparencia(
        base_url="https://api.portaldatransparencia.gov.br",
        api_key=os.environ["PORTAL_DA_TRANSPARENCIA_API_KEY"],
    ),
    input_queue_reference="government_agencies_output",
    output_queues_references=["public_agents_output"],
)
async def crawl_public_agents(
    content: dict[str, Any], portal_da_transparencia_client: PortalDaTransparencia
):
    """
    This job crawls the web.
    """
    public_agents_endpoint = portal_da_transparencia_client.ServidoresEndpoint

    async for item in iterate_over_pages(
        lambda page: portal_da_transparencia_client.get_parsed_data(
            public_agents_endpoint,
            params={
                "orgaoServidorExercicio": content["codOrgaoExercicioSiape"],
                "pagina": page,
            },
        )
    ):
        yield item


@job(
    group_path="crawlers",
    parameters=MongoDbProducerParameters,
    instance_parameters=MongoDbProducerParameters(
        mongodb_url=os.environ["MONGODB_URL"],
        mongodb_database=os.environ["MONGODB_DATABASE"],
        mongodb_collection=os.environ[
            "MONGODB_PORTAL_DA_TRANSPARENCIA_SERVIDORES_COLLECTION"
        ],
    ),
    input_queue_reference="public_agents_output",
)
async def portal_da_transparencia_crawlers_writer(
    fself, content: dict[str, Any], parameters: MongoDbProducerParameters, on_first_run
):
    """
    This job writes data to a MongoDB collection.
    """

    @on_first_run()
    async def __on_first_run(
        fself,
        content: dict[str, Any],
        parameters: MongoDbProducerParameters,
        on_first_run,
    ):
        mongodb_url = parameters.mongodb_url

        client = MongoClient(mongodb_url)
        fself["mongo_client"] = client

    await __on_first_run

    client: MongoClient = fself["mongo_client"]

    mongodb_database = parameters.mongodb_database
    mongodb_collection = parameters.mongodb_collection
    db = client[mongodb_database]
    collection = db[mongodb_collection]
    collection.insert_one(content)
