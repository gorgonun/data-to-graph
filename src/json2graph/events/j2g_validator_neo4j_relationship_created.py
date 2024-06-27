from dataclasses import dataclass
import functools
from turbo_c2.turbo_events import Event


@dataclass(frozen=True)
class J2GValidatorNeo4JRelationshipCreated(Event):
    src_node_id: int
    dest_node_id: int
    relationship_name: str

    def __reduce__(self):
        return functools.partial(self.__class__, **self.data()), ()
