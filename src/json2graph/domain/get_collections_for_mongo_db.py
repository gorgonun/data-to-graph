from pydantic import BaseModel


class GetCollectionsForMongoDb(BaseModel):
    mongodb_url: str
    mongodb_database: str
