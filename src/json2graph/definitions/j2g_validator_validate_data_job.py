from dataclasses import dataclass, field, replace
import json
from typing import Type
import uuid
from turbo_c2 import job_definition, DynamicJobHelperApi
from turbo_c2.commands import (
    MemoryResource, JsonResource
)

from json2graph.events.j2g_validator_neo4j_node_created import (
    J2GValidatorNeo4JNodeCreated,
)
from json2graph.events.neo4j_relationship_created import Neo4JRelationshipCreated
from json2graph.clients.neo4j_client import Neo4jClient
from json2graph.parameters.j2g_validator_validate_data_parameters import (
    J2GValidatorValidateDataParameters,
)
from json2graph.validator.base_with_hash import BaseWithHash
from json2graph.validator.j2g_validator_model import J2GValidator


@dataclass
class NodeValidationResult:
    was_content_validated: bool
    relationship_validation_fields: dict[str, int] = field(default_factory=dict)
    relationship_validated_fields: dict[str, int] = field(default_factory=dict)

    @property
    def was_relationship_validated(self):
        return self.relationship_validation_fields == self.relationship_validated_fields

    @property
    def is_validated(self):
        return self.was_content_validated and self.was_relationship_validated
    
    def add_validation_field(self, field: str, number_of_validations: int = 1):
        if field in self.relationship_validation_fields:
            raise ValueError(f"Field {field} already in relationship validation fields")

        self.relationship_validation_fields[field] = number_of_validations
        self.relationship_validated_fields[field] = 0
    
    def add_validated_field(self, field: str, value: int = 1):
        if field in self.relationship_validation_fields:
            self.relationship_validated_fields[field] += value
            return self

        raise ValueError(f"Field {field} not in relationship validation fields")


@job_definition(input_queue_reference="j2g_validator_validate_data")
async def j2g_validator_validate_data(
    fself,
    content: J2GValidatorNeo4JNodeCreated | Neo4JRelationshipCreated,
    api: DynamicJobHelperApi,
    on_first_run,
    parameters: J2GValidatorValidateDataParameters,
):
    """
    This job generate random model and data for the J2GValidator
    """

    @on_first_run()
    async def __on_first_run(
        fself,
        content: J2GValidatorNeo4JNodeCreated | Neo4JRelationshipCreated,
        api: DynamicJobHelperApi,
        on_first_run,
        parameters: J2GValidatorValidateDataParameters,
    ):
        fself["validator"] = J2GValidator(
            Neo4jClient.from_url(
                parameters.neo4j_url,
                parameters.neo4j_user,
                parameters.neo4j_password,
            )
        )

        fself["error_counter"] = 0
        fself["success_counter"] = 0
        fself["node_counter"] = {"error": 0, "success": 0}
        fself["relationship_counter"] = {"error": 0, "success": 0}
        fself["uuid"] = uuid.uuid4().hex
        fself["to_delete"] = {}

    await __on_first_run

    print("validating data", content)

    if isinstance(content, J2GValidatorNeo4JNodeCreated):

        saved_data = await api.central_api.execute(JsonResource.get(content.data_uuid))
        SavedModel: Type[BaseWithHash] = await api.central_api.execute(
            MemoryResource.get(content.data_uuid)
        )

        if not SavedModel:
            print(f"Model not found: {content.data_uuid}")
            return

        try:
            model_instance = SavedModel.model_validate(saved_data)

        except Exception as e:
            print(
                f"Error validating data: {e}. Saved: {saved_data}\n\nmodel: {SavedModel.model_json_schema()}"
            )
            raise

        flat_model = model_instance.flat_model_instance()

        result, model_in_neo4j = fself["validator"].validate_flat_model(
            content.node_id, flat_model
        )

        if not model_in_neo4j:
            print(f"Model not found in Neo4J: {content.node_id}")

        data_in_neo4j = json.dumps(
            model_in_neo4j
            if isinstance(model_in_neo4j, dict)
            else model_in_neo4j.model_dump(mode="json") if model_in_neo4j else None
        )

        if not content.data_uuid in fself["to_delete"]:
            fself["to_delete"][content.data_uuid] = NodeValidationResult(False)

            for field_name in model_instance.relation_fields_names():
                try:
                    field_value = getattr(model_instance, field_name)

                except:
                    print("Error getting field value")
                    print(f"Model: {model_instance}")
                    print(e)
                    return

                if isinstance(field_value, list):
                    fself["to_delete"][content.data_uuid].add_validation_field(field_name, len(field_value))

                else:
                    fself["to_delete"][content.data_uuid].add_validation_field(field_name)

        fself["to_delete"][content.data_uuid] = replace(
            fself["to_delete"][content.data_uuid], was_content_validated=True
        )

        to_delete_key = content.data_uuid
        counter_key = "node_counter"

    elif isinstance(content, Neo4JRelationshipCreated):
        with fself["validator"].client as client:
            written_data = client.get_node_by_field("__jtg_id", content.origin_id)

        if not written_data:
            print(f"Node not found: {content.origin_id}")
            return
        
        data = written_data[0]["n"]
        data_uuid = data["data_uuid"]

        saved_data = await api.central_api.execute(JsonResource.get(data_uuid))
        SavedModel: Type[BaseWithHash] = await api.central_api.execute(
            MemoryResource.get(data_uuid)
        )

        if not SavedModel:
            print(f"Model not found: {data_uuid}")
            return

        try:
            model_instance = SavedModel.model_validate(saved_data)

        except Exception as e:
            print(
                f"Error validating data: {e}. Saved: {saved_data}\n\nmodel: {SavedModel.model_json_schema()}"
            )
            raise

        result = fself["validator"].validate_relationship(
            content.origin_id,
            content.destination_id,
            model_instance,
            content.relationship_name,
        )

        data_in_neo4j = None

        if not data_uuid in fself["to_delete"]:
            fself["to_delete"][data_uuid] = NodeValidationResult(False)

            for field_name in model_instance.relation_fields_names():
                try:
                    field_value = getattr(model_instance, field_name)

                except:
                    print("Error getting field value")
                    print(f"Model: {model_instance}")
                    print(e)
                    return

                if isinstance(field_value, list):
                    fself["to_delete"][data_uuid].add_validation_field(field_name, len(field_value))

                else:
                    fself["to_delete"][data_uuid].add_validation_field(field_name)

        fself["to_delete"][data_uuid].add_validated_field(content.relationship_name)
        to_delete_key = data_uuid
        counter_key = "relationship_counter"

    if result.is_error():
        fself["error_counter"] += 1
        fself[counter_key]["error"] += 1

    else:
        fself["success_counter"] += 1
        fself[counter_key]["success"] += 1

    print(
        f"Resume: error: {fself['error_counter']}, success: {fself['success_counter']}"
    )

    with open(f"validation_results.txt", "a") as f:
        f.write(
            f"Validation:\n\nGenerated Data:\n{saved_data}\n\nModel json schema:\n{SavedModel.model_json_schema()}\n\nData on Neo4J:\n{data_in_neo4j}\n\nFailure reason:\n{result.message}\n\n"
        )

    with open("resume.txt", "w") as f:
        f.write(
            f"error: {fself['error_counter']}, success: {fself['success_counter']}\n\nCreated:\nError: {fself['node_counter']['error']}, Success: {fself['node_counter']['success']}\n\nRelationship:\nError: {fself['relationship_counter']['error']}, Success: {fself['relationship_counter']['success']}\n\n"
        )

    if fself["to_delete"][to_delete_key].is_validated:
        try:
            await api.central_api.execute(JsonResource.delete(to_delete_key))
            await api.central_api.execute(MemoryResource.delete(to_delete_key))
        
        # FIXME: Fix data deletion
        except Exception as e:
            print(f"Error deleting data: {to_delete_key}")
            print(e)
