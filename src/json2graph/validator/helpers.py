import re
from typing import Type, TypeVar
from pydantic import BaseModel

from json2graph.validator.model_creators.create_random_data import CreateRandomData


B = TypeVar("B", bound=BaseModel)


def to_snake_case(name: str):
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    name = re.sub('__([A-Z])', r'_\1', name)
    name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
    return name.lower()


def generate_test_model_data(model: Type[B]) -> B:
    return CreateRandomData.create_random_data_from_model(model)
