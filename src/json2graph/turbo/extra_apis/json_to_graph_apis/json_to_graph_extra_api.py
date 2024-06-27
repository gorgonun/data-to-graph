from turbo_c2.extra_api import DefaultExtraApiWithSubApis, DefinitionResourceApi, ResourceApi

from json2graph.turbo.extra_apis.commands.migration_creator_definition import MigrationCreatorDefinition
from json2graph.turbo.extra_apis.commands.migration_resource import MigrationResource
from json2graph.turbo.extra_apis.resources.json_to_graph_enum import JsonToGraphEnum


class JsonToGraphExtraApi(DefaultExtraApiWithSubApis):
    def __init__(self, central_api=None) -> None:

        self.__apis = [
            DefinitionResourceApi(MigrationCreatorDefinition),
            ResourceApi(
                MigrationResource,
                creators_keys=MigrationCreatorDefinition.get_api_reference().complete_id_path,
            ),
        ]

        super().__init__(
            self.__apis,
            [
                *[
                    command
                    for api in self.__apis
                    for command in api.get_command_structure()
                ],
            ],
            JsonToGraphEnum.API_ID.value,
            central_api=central_api,
        )
