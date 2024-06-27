from dataclasses import dataclass
import functools
from turbo_c2.turbo_events import Event


@dataclass(frozen=True)
class Neo4JRelationshipCreated(Event):
    origin_id: int
    origin_label: str
    destination_id: int
    destination_label: str
    relationship_name: str

    def __reduce__(self):
        return functools.partial(self.__class__, **self.data()), ()
