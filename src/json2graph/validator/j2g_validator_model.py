from enum import Enum
from typing import Type
import uuid

from pydantic import ValidationError
from json2graph.clients.neo4j_client import Neo4jClient
from json2graph.validator.base_with_hash import BaseWithHash
from json2graph.validator.helpers import generate_test_model_data
from json2graph.validator.validation_result import ValidationResult
from json2graph.validator.validation_status import ValidationStatus


class J2GValidationFailures(str, Enum):
    UUID_NOT_FOUND = "UUID_NOT_FOUND"


class J2GValidator:
    validation_status = {
        "success": ValidationStatus(name="success", is_success=True),
        "failure": ValidationStatus(name="failure", is_error=True),
    }

    def __init__(self, client: Neo4jClient):
        self.__client = client

    @property
    def client(self):
        return self.__client

    def validate_flat_model(self, jtg_id: int, model_instance: BaseWithHash):
        with self.__client:
            written_data = self.__client.get_node_by_field("__jtg_id", jtg_id)

        if not written_data:
            return ValidationResult(
                self.validation_status["failure"], J2GValidationFailures.UUID_NOT_FOUND, "UUID not found in database"
            ), None
        
        try:
            new_instance = type(model_instance).model_validate(written_data[0]["n"])
            return ValidationResult(self.validation_status["success"]), new_instance
        
        except ValidationError as e:
            return ValidationResult(
                self.validation_status["failure"], J2GValidationFailures.UUID_NOT_FOUND, e.json()
            ), written_data[0]["n"]
        
    def validate_relationship(self, src_id: int, dest_id: int, model_instance: BaseWithHash, relationship_name: str):
        dest_label: BaseWithHash = getattr(model_instance, relationship_name)

        if not dest_label:
            return ValidationResult(
                self.validation_status["failure"], message="Relationship not found on model"
            )
        
        with self.__client:
            written_data = self.__client.check_relationship_existence(
                "__jtg_id",
                src_id,
                "__jtg_id",
                dest_id,
                relationship_name,
            )

        if not written_data:
            return ValidationResult(
                self.validation_status["failure"], message="Relationship not found in database"
            )
        
        return ValidationResult(self.validation_status["success"])

    @classmethod
    def generate_random_data(cls, model: Type[BaseWithHash]):
        result = generate_test_model_data(model)
        
        return result
    
    @classmethod
    def generate_random_data_as_dict(cls, model: Type[BaseWithHash]):
        return generate_test_model_data(model).model_dump()
