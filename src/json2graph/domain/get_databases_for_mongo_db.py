from pydantic import BaseModel


class GetDatabasesForMongoDb(BaseModel):
    mongodb_url: str
