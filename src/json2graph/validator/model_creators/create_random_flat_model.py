from dataclasses import dataclass
import random
from typing import Any, List
import uuid

from pydantic import create_model

from json2graph.validator.base_with_hash import BaseWithHash


@dataclass(frozen=True)
class CreateRandomFlatModel:
    attribute_size: int | None = None
    prefix: str | None = None
    name: str | None = None

    def generate_attributes(
        self, attributes_size: int | None = None, prefix: str | None = None
    ):
        attributes: dict[str, tuple[type, Any]] = {}

        for i in range(attributes_size or self.attribute_size):
            attr_type = random.choice([int, str, float, bool])
            is_optional = random.choices(population=[True, False], weights=[0.2, 0.8])[0]
            is_list = random.choices(population=[True, False], weights=[0.2, 0.8])[0]
            prefix = f"{prefix}" if prefix else f"{self.prefix}_" if self.prefix else ""
            fixed_attr_type = List[attr_type] if is_list else attr_type
            attr_type_with_optional_information = fixed_attr_type if not is_optional else fixed_attr_type | None
            # Default None, as None in neo4j deletes the property
            attr_default_value_information = None if is_optional else ...
            list_default_value_information = None if is_optional else []

            attributes[f"{prefix}a{i}"] = (attr_type_with_optional_information, attr_default_value_information if not is_list else list_default_value_information)

        return attributes

    def create_new_model(
        self,
        attributes_size: int | None = None,
        prefix: str | None = None,
        name: str | None = None,
    ):
        attributes = self.generate_attributes(
            attributes_size=attributes_size, prefix=prefix
        )

        return create_model(
            name or f"RandomModel_{uuid.uuid4().hex}", **attributes, __base__=BaseWithHash
        )
