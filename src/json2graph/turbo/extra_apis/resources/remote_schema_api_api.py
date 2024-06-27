from typing import Iterable
from json2graph.domain.schema import Schema
from json2graph.turbo.extra_apis.resources.interfaces.schema_api_api import SchemaApiApi


class RemoteSchemaApiApi(SchemaApiApi):
    # Schema api is an ActorRef
    def __init__(self, schema_api: SchemaApiApi):
        self.schema_api = schema_api
    
    async def get_schemas(self) -> dict[int, Schema]:
        return await self.schema_api.get_schemas.remote()
    
    async def next_increment(self):
        return await self.schema_api.next_increment.remote()
    
    async def add_schema(self, schema: Schema):
        return await self.schema_api.add_schema.remote(schema)
    
    async def update_schema(self, schema_id: int, columns: Iterable[str]):
        return await self.schema_api.update_schema.remote(schema_id, columns)
    
    async def update_schemas(self, data: list[tuple[int, Iterable[str]]]):
        return await self.schema_api.update_schemas.remote(data)
    
    async def has(self, schema_id: str):
        return await self.schema_api.has.remote(schema_id)
    
    async def new_incomplete_schema(self, column_information = None):
        return await self.schema_api.new_incomplete_schema.remote(column_information)
    
    async def new_schema_from_columns(self, columns: Iterable[str]):
        return await self.schema_api.new_schema_from_columns.remote(columns)
    
    async def new_schemas_from_columns(self, columns_data_with_id: dict[str, list[str]]):
        return await self.schema_api.new_schemas_from_columns.remote(columns_data_with_id)
    
    async def update_column_information(self, schema_id: int, column_name: str, is_relationship: bool):
        return await self.schema_api.update_column_information.remote(schema_id, column_name, is_relationship)
    
    async def update_column_informations(self, data: list[tuple[int, str, bool]]):
        return await self.schema_api.update_column_informations.remote(data)
    
    async def find_schema_by_columns(self, columns: Iterable[str]) -> Schema | None:
        return await self.schema_api.find_schema_by_columns.remote(columns)
    
    async def find_schemas_by_columns(self, columns_mapping: dict[str, list[str]]) -> dict[str, Schema]:
        return await self.schema_api.find_schemas_by_columns.remote(columns_mapping)
