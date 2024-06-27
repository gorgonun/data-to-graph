from pydantic import BaseModel

from json2graph.validator.base_with_hash import BaseWithHash


class CreateNewValidatorParameters(BaseModel):
    neo4j_url: str
    neo4j_user: str
    neo4j_password: str
    generate_models_size: int | None = None
    deep_nested_model_kwargs: list[dict[str, int | None]] = []
    default_deep_nested_model_kwargs: dict[str, int | None] = {"max_table_count": 10, "max_depth": 5}
    models: list[BaseWithHash] = []
