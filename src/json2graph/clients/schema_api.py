import asyncio
from typing import Any, Iterable, Tuple
from json2graph.domain.schema import Column, Schema


class SchemaAPI:
    def __init__(self, max_difference_between_schemas: int, meta: dict[str, Any]) -> None:
        self._schemas: dict[int, Schema] = {}
        self.max_difference_between_schemas = max_difference_between_schemas
        self.last_id = 0
        self.__schema_lock: dict[str, asyncio.Lock] = {}
    
    @property
    def schemas(self):
        return self._schemas
    
    def next_increment(self):
        self.last_id = self.last_id + 1
        return self.last_id

    def add_schema(self, schema: Schema):
        self._schemas[schema.id] = schema
        self.__schema_lock[schema.id] = asyncio.Lock()
    
    async def update_schema(self, schema_id: int, columns: Iterable[str]):
        lock = self.__schema_lock[schema_id]
        await lock.acquire()

        schema_columns = set(self._schemas[schema_id].column_information.keys())
        current_columns = set(columns)
        new_optional_columns = current_columns - schema_columns
        required_to_optional = schema_columns - current_columns
    
        self._schemas[schema_id].column_information.update({k: Column(k, True, False) for k in (new_optional_columns.union(required_to_optional))})

        lock.release()
        return self._schemas[schema_id]
    
    async def update_schemas(self, data: list[tuple[int, Iterable[str]]]):
        for schema_id, columns in data:
            await self.update_schema(schema_id, columns)

    def has(self, schema_id: str):
        return schema_id in self._schemas
    
    def new_incomplete_schema(self, column_information = None):
        schema = Schema(self.next_increment(), column_information or {})
        self._schemas[schema.id] = schema
        self.__schema_lock[schema.id] = asyncio.Lock()
        return schema
    
    def new_schema_from_columns(self, columns: Iterable[str]):
        schema = Schema(self.next_increment(), {k: Column(k, True, False) for k in columns})
        self._schemas[schema.id] = schema
        self.__schema_lock[schema.id] = asyncio.Lock()
        return schema
    
    async def new_schemas_from_columns(self, columns_data_with_id: dict[str, list[str]]):
        id_with_schema_id = {}
        
        for data_id, columns in columns_data_with_id.items():
            current_schema = self.find_schema_by_columns(columns)
            if not current_schema:
                current_schema = self.new_schema_from_columns(columns)
            
            else:
                await self.update_schema(current_schema.id, columns)
            
            id_with_schema_id[data_id] = current_schema.id

        result = {}

        # This will get the latest schema version
        for data_id, schema_id in id_with_schema_id.items():
            result[data_id] = self._schemas[schema_id]

        return result
    
    def update_column_information(self, schema_id: int, column_name: str, is_relationship: bool):
        self._schemas[schema_id].column_information[column_name].is_relationship = is_relationship

    def update_column_informations(self, data: list[tuple[int, str, bool]]):
        for schema_id, column_name, is_relationship in data:
            self.update_column_information(schema_id, column_name, is_relationship)

    def find_schema_by_columns(self, columns: Iterable[str]) -> Schema | None:
        most_similar_schema: Tuple[int, float] | None = None

        for schema in self._schemas.values():
            schema_set = set(schema.column_information.keys())
            columns_set = set(columns)
            columns_diff_from_schema = schema_set - columns_set
            columns_diff_from_data = columns_set - schema_set
            diff_rate = len(columns_diff_from_schema.union(columns_diff_from_data)) / len(schema_set.union(columns_set))

            if (most_similar_schema is None and diff_rate <= self.max_difference_between_schemas) or (most_similar_schema is not None and diff_rate <= self.max_difference_between_schemas and diff_rate < most_similar_schema[1]):
                most_similar_schema = (schema.id, diff_rate)

        return self._schemas[most_similar_schema[0]] if most_similar_schema is not None else None

    def find_schemas_by_columns(self, columns_mapping: dict[str, list[str]]) -> dict[str, Schema]:
        return {k: self.find_schema_by_columns(v) for k, v in columns_mapping.items()}
