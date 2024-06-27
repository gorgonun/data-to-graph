from dataclasses import dataclass
import functools
from turbo_c2.turbo_events import Event


@dataclass(frozen=True)
class J2GValidatorNeo4JNodeCreated(Event):
    data_uuid: str
    node_id: int

    def __reduce__(self):
        return functools.partial(self.__class__, **self.data()), ()
