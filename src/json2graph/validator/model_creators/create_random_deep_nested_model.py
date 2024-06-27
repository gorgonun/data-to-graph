import random

from json2graph.validator.base_with_hash import BaseWithHash
from json2graph.validator.model_creators.create_random_flat_model import CreateRandomFlatModel
from json2graph.validator.model_creators.create_random_nested_model import CreateRandomNestedModel


class CreateRandomDeepNestedModel:
    def __init__(
        self, max_table_count: int | None = None, max_depth: int | None = None, min_relations: int = 0, max_relations: int = 10
    ):
        self.__max_depth = max_depth or random.randint(1, 10)
        self.__table_count = 0
        self.__max_table_count = max_table_count or random.randint(1, 10)
        self.__min_relations = min_relations
        self.__max_relations = max_relations
        self.__relation_count = 0

    def new_model(self):
        level = 0
        self.__table_count = 0

        def generate_model(level: int, models: dict[str, BaseWithHash], pending: set[str], prefix: str | None = None):
            attribute_size = random.randint(2, 10)
            max_allowed_relations = min(
                attribute_size - 1, self.__max_table_count - self.__table_count, self.__max_relations - self.__relation_count
            )
            relations = (
                random.randint(self.__min_relations if not self.__relation_count else 0, max_allowed_relations)
                if level <= self.__max_depth and max_allowed_relations > 0 and self.__min_relations < max_allowed_relations
                else 0
            )

            self.__relation_count += relations

            if relations == 0:
                return CreateRandomFlatModel().create_new_model(attributes_size=attribute_size, prefix=prefix)

            data = CreateRandomFlatModel().create_new_model(attributes_size=attribute_size - relations, prefix=prefix)
            relations_data = []

            for _ in range(relations):
                is_new_table = random.choices(
                    population=[True, False], weights=[0.2, 0.8]
                )[0] if prefix or models.get(prefix) else True
                is_relation_list = random.choices(
                    population=[True, False], weights=[0.2, 0.8]
                )[0]

                if not is_new_table:
                    not_pending_options = list(set(models.keys()).difference(pending))

                    if not_pending_options:
                        table_name = random.choice(not_pending_options)
                        model = models[table_name]
                    
                    else:
                        is_new_table = True

                if is_new_table:
                    self.__table_count += 1
                    table_name = f"t{self.__table_count}"
                    pending.add(table_name)
                    model = generate_model(level + 1, models, pending, table_name)
                    models[table_name] = model

                if is_relation_list:
                    relations_data.append((model, True))
                else:
                    relations_data.append((model, False))

            return CreateRandomNestedModel(data).merge_models(relations_data, new_name=prefix)

        return generate_model(level, {}, set())
