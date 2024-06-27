from dataclasses import dataclass
from typing import Annotated, Type
import uuid

from pydantic import create_model

from json2graph.validator.base_with_hash import BaseWithHash
from json2graph.validator.helpers import to_snake_case


@dataclass(frozen=True)
class CreateRandomNestedModel:
    base_model: BaseWithHash
    prefix: str = "RandomNestedModel_"

    def new_name(self) -> str:
        return f"{self.prefix}{uuid.uuid4().hex.replace('-', '')}"

    def merge_models(self, models_to_aggregate: list[tuple[Type[BaseWithHash], bool]], new_name: str | None = None) -> BaseWithHash:
        if new_name is None:
            new_name = self.new_name()

        model_fields = {}
        for (model, is_list) in models_to_aggregate:
            model_type = model if not is_list else list[model]

            model_fields.setdefault(to_snake_case(model.__name__), (Annotated[model_type, {"is_relation": True}], ...))

        return create_model(new_name, **model_fields, __base__=self.base_model)
