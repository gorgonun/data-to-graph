from json2graph.parameters.migration_parameters import MigrationParameters


class JsonToNodeParameters(MigrationParameters):
    root_table: str
    event_data_destination_queue: str
