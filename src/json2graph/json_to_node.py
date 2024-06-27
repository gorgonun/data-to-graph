import asyncio
from collections import deque
from enum import Enum
from typing import Any, Callable
import uuid
from json2graph.turbo.extra_apis.resources.id_manager_api import IdManagerApi
from json2graph.domain.node_feedback import NodeFeedback
from json2graph.domain.relationship_reference import RelationshipReference
from json2graph.domain.node import Node, PartialNode
from json2graph.domain.schema import Schema
from json2graph.domain.table import Table
from json2graph.turbo.extra_apis.resources.remote_schema_api_api import RemoteSchemaApiApi


class SchemaApiWork(Enum):
    UPDATE = "update"
    CREATE = "create"
    FIND_SCHEMA_BY_COLUMNS = "find_schema_by_columns"
    ROOT_UPDATE = "root_update"


class JsonToNode():
    def __init__(self, root_name: str, schema_api: RemoteSchemaApiApi, id_manager: IdManagerApi) -> None:
        self.root_name = root_name
        self.schema_api = schema_api
        self.table_mapping: dict[str, list[Table]] = {}
        self.schema_id_table_mapping: dict[int, Table] = {}
        self.id_manager = id_manager
        self.root_table = None
        self.table_lock = asyncio.Lock()
        self.increment_buffer_mapping = {}

    async def create_root_table(self):
        return await self.create_table(self.root_name, await self.schema_api.new_incomplete_schema())
    
    async def get_id_increment(self, name: str):
        if self.increment_buffer_mapping.setdefault(name, deque()):
            return self.increment_buffer_mapping[name].popleft()
        
        self.increment_buffer_mapping[name].extend(await self.id_manager.get_next_increments(name, 100, create=True))
        return self.increment_buffer_mapping[name].popleft()

    async def next_table_increment(self):
        result = await self.get_id_increment(f"{self.root_name}_table")
        if not result:
            raise RuntimeError("Table increment could not be created")
        
        return result
    
    async def next_node_increment(self):
        result = await self.get_id_increment(f"{self.root_name}_node")
        if not result:
            raise RuntimeError("Node increment could not be created")
        
        return result

    async def create_table(self, name: str, schema: Schema):
        table = Table(await self.next_table_increment(), name, schema)
        self.table_mapping.setdefault(name, []).append(table)
        self.schema_id_table_mapping[schema.id] = table
        return table
    
    def get_table(self, name: str, schema_id: int):
        tables = self.table_mapping.get(name, [])
        if not tables:
            table_by_schema = self.schema_id_table_mapping.get(schema_id)
            return table_by_schema
        
        elif len(tables) == 1:
            if schema_id and tables[0].schema.id != schema_id:
                return None
            return tables[0]
        
        else:
            filtered_table = list(filter(lambda t: t.schema.id == schema_id, tables))[0] if schema_id else tables[0]
            return filtered_table
    
    async def on_subnode_default(self, node: PartialNode, src_column: str, level: int, sub_node: dict[str, Any]):
        # relation = await self.migrate_data(sub_node, level + 1, src_column, self.on_subnode_default)
        relation = await self.migrate_data(NodeFeedback(data=sub_node, level=level + 1, parent_field=src_column, processing_id=None), on_subnode=self.on_subnode_default)
        node.relations.append(relation)
        return RelationshipReference(relation.table.name, relation.id)

    async def migrate_data(self, json_data: list[NodeFeedback], on_subnode: Callable[[PartialNode, str, int, dict[str, Any]], RelationshipReference] | None = None):
        # if isinstance(json_data, NodeFeedback):
        #     return await self.migrate_dict(json_data.data, json_data.level, on_subnode or self.on_subnode_default, parent_field=json_data.parent_field, processing_id=str(json_data.processing_id))
        return await self.migrate_all_data(json_data, on_subnode=on_subnode)
        
    async def migrate_all_data(self, migration_data: list[NodeFeedback], on_subnode: Callable[[PartialNode, str, int, dict[str, Any]], RelationshipReference] | None = None):
        schema_api_work: dict[SchemaApiWork, list[NodeFeedback]] = {}
        update_schema_data = []
        found_data = []
        create_schema_data = {}
        create_tables_data = {}
        partial_nodes = []
        
        for feedback in migration_data:
            if feedback.level == 0:
                async with self.table_lock:
                    if not self.root_table:
                        self.root_table = await self.create_root_table()

                schema_api_work.setdefault(SchemaApiWork.ROOT_UPDATE, []).append(feedback)
            
            elif feedback.level > 0 and feedback.parent_field:
                schema_api_work.setdefault(SchemaApiWork.FIND_SCHEMA_BY_COLUMNS, []).append(feedback)

            else:
                raise RuntimeError(f"Invalid level {feedback.level} or parent {feedback.parent_field}")
        
        for root_data in schema_api_work.get(SchemaApiWork.ROOT_UPDATE, []):
            schema = await self.schema_api.update_schema(self.root_table.schema.id, root_data.data.keys())
            self.root_table.schema = schema
            node = PartialNode(id=await self.next_node_increment(), table=self.root_table, relations=[])
            partial_nodes.append((node, root_data))

        data_with_ids = {
            uuid.uuid4().hex: feedback
            for feedback in schema_api_work.get(SchemaApiWork.FIND_SCHEMA_BY_COLUMNS, [])
        }

        schemas = await self.schema_api.find_schemas_by_columns({k: v.data.keys() for k, v in data_with_ids.items()})
        
        for (feedback_id, schema) in schemas.items():
            feedback = data_with_ids[feedback_id]
            table = self.get_table(feedback.parent_field, schema.id) if schema else None

            if schema:
                update_schema_data.append((schema, table, feedback))

            if schema and table and schema.id != table.schema.id:
                create_tables_data.setdefault(feedback.parent_field, []).append((schema, table, feedback))

            elif not schema and not table:
                create_schema_data[feedback_id] = (schema, table, feedback)

            elif schema and not table:
                create_tables_data.setdefault(feedback.parent_field, []).append((schema, table, feedback))

            else:
                found_data.append((schema, table, feedback))
            
        await self.schema_api.update_schemas([(schema.id, feedback.data.keys()) for (schema, _, feedback) in update_schema_data])

        new_schemas = await self.schema_api.new_schemas_from_columns({k: feedback.data.keys() for k, (schema, table, feedback) in create_schema_data.items()})

        for (schema, table, feedback) in found_data:
            node = PartialNode(id=await self.next_node_increment(), table=table, relations=[])
            partial_nodes.append((node, feedback))

        for (feedback_id, schema) in new_schemas.items():
            feedback = data_with_ids[feedback_id]
            table = self.get_table(feedback.parent_field, schema.id) if schema else None

            if not table:
                async with self.table_lock:
                    table = await self.create_table(feedback.parent_field, schema)

            node = PartialNode(id=await self.next_node_increment(), table=table, relations=[])
            partial_nodes.append((node, feedback))

        for (parent_field, data) in create_tables_data.items():
            for (schema, table, feedback) in data:
                table = self.get_table(parent_field, schema.id) if schema else None

                if not table:
                    async with self.table_lock:
                        table = await self.create_table(parent_field, schema)

                node = PartialNode(id=await self.next_node_increment(), table=table, relations=[])
                partial_nodes.append((node, feedback))
        
        nodes = []
        update_column_information_data = []

        for (node, feedback) in partial_nodes:
            # relation_items = []
            values = {
                "common": {},
                "relationship": {},
                "processing_id": str(feedback.processing_id) if feedback.processing_id else None
            }

            # before_data_analysis = time.perf_counter()
            for (k, v) in feedback.data.items():
                if isinstance(v, (dict, list)) and not v:
                    continue

                if isinstance(v, dict):
                    # relation_items.append((k, v))
                    reference = await on_subnode(node, k, feedback.level, v)
                    values["relationship"].setdefault(k, []).append(reference)
                    update_column_information_data.append((node.table.schema.id, k, True))
                    # reference = await on_subnode(node, k, level, v)
                    # values["relationship"][k] = reference
                    # await self.schema_api.update_column_information(node.table.schema.id, k, True)
                elif isinstance(v, list):
                    for item in v:
                        if isinstance(item, dict):
                            # relation_items.append((k, item))
                            reference = await on_subnode(node, k, feedback.level, item)
                            values["relationship"].setdefault(k, []).append(reference)
                            update_column_information_data.append((node.table.schema.id, k, True))
                        else:
                            values["common"][k] = v
                else:
                    values["common"][k] = v

            node = Node(id=node.id, table=node.table, common_values=values["common"], relationship_references=values["relationship"], relations=node.relations, processing_id=values["processing_id"])
            nodes.append(node)

        await self.schema_api.update_column_informations(update_column_information_data)

        if len(nodes) != len(migration_data):
            raise RuntimeError(f"Node creation failed. Expected {len(migration_data)} nodes, got {len(nodes)}", nodes, migration_data)

        return nodes
