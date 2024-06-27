from turbo_c2 import job_definition
from pymongo import MongoClient

from json2graph.parameters.mongo_db_producer_parameters import MongoDbProducerParameters


@job_definition(
    parameters=MongoDbProducerParameters,
)
async def mongo_db_listener(
    fself, parameters: MongoDbProducerParameters, on_first_run
):
    """
    This job writes data to a MongoDB collection.
    """

    @on_first_run()
    async def __on_first_run(
        fself,
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

    change_stream = collection.watch(
        [{"$match": {"operationType": {"$in": ["insert"]}}}]
    )

    for change in change_stream:
        yield change
