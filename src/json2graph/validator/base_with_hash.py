from functools import cached_property
from itertools import chain
import json
from typing import cast
import uuid
from pydantic import BaseModel, computed_field, create_model
from pydantic_core import PydanticUndefined


class BaseWithHash(BaseModel):
    data_uuid: uuid.UUID
    
    @computed_field
    @property
    def validation_model(self) -> bool:
        return True

    def __hash__(self):
        return hash(json.dumps(self.model_dump(), sort_keys=True))
    
    def get_all_uuids(self):
        result = set([self.data_uuid])

        for relation_field_name in self.relation_fields_names():
            relation = getattr(self, relation_field_name)
            if isinstance(relation, list):
                relation = cast(list[BaseWithHash], relation)
                result.update(chain.from_iterable(item.get_all_uuids() for item in relation))
            else:
                relation = cast(BaseWithHash, relation)
                result.update(relation.get_all_uuids())

        return result
    
    def get_all_models(self):
        result = [self]

        for relation_field_name in self.relation_fields_names():
            relation = getattr(self, relation_field_name)
            if isinstance(relation, list):
                relation = cast(list[BaseWithHash], relation)
                result.extend(chain.from_iterable(item.get_all_models() for item in relation))
            else:
                relation = cast(BaseWithHash, relation)
                result.extend(relation.get_all_models())

        return result

    def flat_hash(self):
        return hash(json.dumps(self.flat_dict(), sort_keys=True))

    def flat_dict(self):
        model = self.model_dump()

        for relation in self.relation_fields_names():
            model.pop(relation, None)

        return model
    
    def flat_model_instance(self):
        return self.flat_model()(**self.flat_dict())
    
    @classmethod
    def relation_fields_names(cls):
        return [
            name
            for name, value in cls.model_fields.items()
            for obj in value.metadata
            if isinstance(obj, dict) and obj.get("is_relation")
        ]
    
    @classmethod
    def flat_fields_names(cls):
        result = [
            name
            for name, value in cls.model_fields.items()
            for obj in (value.metadata or [None])
            if not isinstance(obj, dict) or not obj.get("is_relation")
        ]
        return result

    @classmethod
    def flat_model(cls):
        def get_default_field(name: str):
            if default_factory := cls.model_fields[name].default_factory:
                return default_factory
            
            if default := cls.model_fields[name].default != PydanticUndefined:
                return default
            
            return ...
            
        flat_columns = {
            name: (cls.model_fields[name].annotation, get_default_field(name))
            for name in cls.flat_fields_names()
        }

        return create_model(
            f"{cls.__name__}_FLAT",
            **flat_columns
        )
