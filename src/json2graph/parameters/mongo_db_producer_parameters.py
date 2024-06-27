from json2graph.parameters.migration_parameters import MigrationParameters


class MongoDbProducerParameters(MigrationParameters):
    mongodb_collection: str
    mongodb_url: str | None = None
    mongodb_database: str | None = None
    mongodb_producer_limit: int | None = None
