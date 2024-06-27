import asyncio
import json
from pymongo import MongoClient
from turbo_c2 import job_definition, DynamicJobHelperApi
from bson import json_util

from json2graph.parameters.mongo_db_producer_parameters import MongoDbProducerParameters


@job_definition(
    single_run=True,
    output_queues_references=["mongodb_producer_output"],
    parameters=MongoDbProducerParameters,
    iterable_chunk_size=10,
)
async def mongodb_producer(
    fself, parameters: MongoDbProducerParameters, api: DynamicJobHelperApi, on_first_run
):
    """
    This job reads data from a MongoDB collection and sends it to the output queue.
    Parameters:
    MongoDB URL: The URL of the MongoDB server.
    MongoDB Database: The name of the database.
    MongoDB Collection: The name of the collection.
    """

    @on_first_run()
    async def __on_first_run(
        fself,
        parameters: MongoDbProducerParameters,
        api: DynamicJobHelperApi,
        on_first_run,
    ):
        fself["j2g_read_data"] = await api.metrics_api.counter(
            "j2g_read_data",
            "Number of data read from MongoDB",
            labels={
                "job_instance": api.job_instance.resource_id,
                "database": parameters.mongodb_database,
                "collection": parameters.mongodb_collection,
            },
        )

    await __on_first_run

    mongodb_url = parameters.mongodb_url
    mongodb_database = parameters.mongodb_database
    mongodb_collection = parameters.mongodb_collection

    client = MongoClient(mongodb_url)
    db = client[mongodb_database]
    collection = db[mongodb_collection]

    result = collection.find()
    limit = parameters.mongodb_producer_limit

    for i, data in enumerate(result):
        await fself["j2g_read_data"].inc()
        data_from_mongo = json.loads(json_util.dumps(data))
        if "_id" in data_from_mongo and isinstance(data_from_mongo["_id"], dict):
            data_from_mongo["_id"] = data_from_mongo["_id"].get("$oid", None)

        yield data_from_mongo

        if limit and i + 1 >= limit:
            break
