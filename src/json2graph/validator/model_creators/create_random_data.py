from inspect import isclass
import random
import string
from types import NoneType, UnionType
from typing import List, Type, TypeVar, Union, get_args, get_origin
import uuid
from json2graph.validator.base_with_hash import BaseWithHash


M = TypeVar("M", bound=BaseWithHash)
AVAILABLE_SIMPLE_TYPES = int | float | str | bool | None | uuid.UUID
AVAILABLE_COMPOSED_TYPES = (
    List[AVAILABLE_SIMPLE_TYPES]
    | dict[str, AVAILABLE_SIMPLE_TYPES]
    | Type[M]
    | List["AVAILABLE_COMPOSED_TYPES"]
    | dict[str, "AVAILABLE_COMPOSED_TYPES"]
)
AVAILABLE_TYPES = AVAILABLE_SIMPLE_TYPES | AVAILABLE_COMPOSED_TYPES


class CreateRandomData:
    @staticmethod
    def is_union(t: Type) -> bool:
        return t is Union or type(t) == UnionType or get_origin(t) is Union

    @staticmethod
    def create_random_int() -> int:
        return random.choices(range(-100000000, 100000000), k=1)[0]

    @staticmethod
    def create_random_float() -> float:
        return random.choices(range(-100000000, 100000000), k=1)[0]

    @staticmethod
    def create_random_string() -> str:
        return "".join(
            random.choices(
                string.ascii_letters + string.digits, k=random.randint(1, 100)
            )
        )

    @staticmethod
    def create_random_bool() -> bool:
        return random.choices([True, False], k=1)[0]

    @staticmethod
    def get_none() -> None:
        return None

    @staticmethod
    def create_random_uuid() -> uuid.UUID:
        return uuid.uuid4()

    @staticmethod
    def create_random_data_for_simple_field(field: AVAILABLE_SIMPLE_TYPES):
        type_mapping = {
            int: CreateRandomData.create_random_int,
            float: CreateRandomData.create_random_float,
            str: CreateRandomData.create_random_string,
            bool: CreateRandomData.create_random_bool,
            None: CreateRandomData.get_none,
            NoneType: CreateRandomData.get_none,
            uuid.UUID: CreateRandomData.create_random_uuid,
        }

        field_type = field
        if CreateRandomData.is_union(field_type):
            field_type = random.choices(get_args(field_type), k=1)[0]
            if field_type is NoneType:
                field_type = None

        if field_type in type_mapping:
            return type_mapping[field_type]()

        raise ValueError(f"Field type {field_type} for field {field} not supported")

    @staticmethod
    def create_random_list_of(
        field_type: Type[List[AVAILABLE_TYPES]], num_samples: int = 10
    ) -> List[AVAILABLE_TYPES]:
        inner_types = get_args(field_type)

        samples_by_type = [
            (inner_type, random.randint(0, num_samples)) for inner_type in inner_types
        ]

        result = []

        for inner_type, num_samples in samples_by_type:
            for _ in range(num_samples):
                if CreateRandomData.is_union(inner_type):
                    inner_type = random.choices(get_args(inner_type), k=1)[0]

                result.extend(
                    CreateRandomData.create_random_data_for_type(inner_type)
                    for _ in range(num_samples)
                )

        return result

    @staticmethod
    def create_random_dict_of(
        field_type: Type[dict[AVAILABLE_SIMPLE_TYPES, AVAILABLE_TYPES]],
        num_samples: int = 10,
    ) -> dict[str, AVAILABLE_TYPES]:
        inner_types = get_args(field_type)
        samples_number = random.randint(0, num_samples)

        result = {}

        for _ in range(samples_number):
            result.update(
                {
                    CreateRandomData.create_random_data_for_type(
                        inner_types[0]
                    ): CreateRandomData.create_random_data_for_type(inner_types[1])
                }
            )

        return result

    @staticmethod
    def create_random_data_for_composed_type(field: AVAILABLE_COMPOSED_TYPES):
        type_mapping = {
            list: CreateRandomData.create_random_list_of,
            dict: CreateRandomData.create_random_dict_of
        }

        field_type = get_origin(field) or field

        if CreateRandomData.is_union(field_type):
            field_type = random.choices(get_args(field), k=1)[0]
            if field_type is NoneType:
                return CreateRandomData.get_none()
            
            else:
                field = field_type
                field_type = get_origin(field) or field

        if field_type in type_mapping:
            return type_mapping[field_type](field)

        if isclass(field_type) and issubclass(field_type, BaseWithHash):
            return CreateRandomData.create_random_data_from_model(field_type)

        raise ValueError(f"Field type {field_type} for {field} not supported")

    @staticmethod
    def is_simple_type(field: Type) -> bool:
        return field in get_args(AVAILABLE_SIMPLE_TYPES)

    @staticmethod
    def is_composed_type(field: Type) -> bool:
        return get_origin(field) in (list, dict) or (
            isclass(field) and issubclass(field, BaseWithHash)
        )
    
    @staticmethod
    def is_optional_composed_type(field: Type) -> bool:
        return CreateRandomData.is_composed_type(field) or field is NoneType

    @staticmethod
    def create_random_data_for_union_type(field: Type[Union[AVAILABLE_TYPES]]):
        if all(CreateRandomData.is_simple_type(t) for t in get_args(field)):
            return CreateRandomData.create_random_data_for_simple_field(field)

        if all(CreateRandomData.is_optional_composed_type(t) for t in get_args(field)):
            return CreateRandomData.create_random_data_for_composed_type(field)

        raise ValueError(f"Field type {field} not supported")

    @staticmethod
    def create_random_data_for_type(field: AVAILABLE_TYPES):
        if CreateRandomData.is_union(field):
            return CreateRandomData.create_random_data_for_union_type(field)

        if CreateRandomData.is_simple_type(field):
            return CreateRandomData.create_random_data_for_simple_field(field)

        if CreateRandomData.is_optional_composed_type(field):
            return CreateRandomData.create_random_data_for_composed_type(field)

        raise ValueError(f"Field type {field} not supported")

    @staticmethod
    def create_random_data_from_model(model: Type[M]) -> M:
        fields_generator_mapping = {}

        for field in model.model_fields:
            fields_generator_mapping[field] = (
                CreateRandomData.create_random_data_for_type(
                    model.model_fields[field].annotation
                )
            )

        return model(**fields_generator_mapping)
