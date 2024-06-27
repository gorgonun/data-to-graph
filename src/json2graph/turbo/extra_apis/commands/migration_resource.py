from turbo_c2.commands import CrudCommand
from json2graph.domain.create_new_migration_parameters import CreateNewMigrationParameters
from json2graph.turbo.extra_apis.resources.json_to_graph_enum import JsonToGraphEnum
from json2graph.turbo.extra_apis.resources.migration import Migration


class MigrationResource(
    CrudCommand[CreateNewMigrationParameters, Migration]
):
    api_identifier = JsonToGraphEnum.API_ID.value
    api_path = "migrations/migration"
