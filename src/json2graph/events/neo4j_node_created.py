from dataclasses import dataclass
import functools
from turbo_c2.turbo_events import Event


@dataclass(frozen=True)
class Neo4JNodeCreated(Event):
    id: int
    label: str
    processing_id: str

    def __reduce__(self):
        return functools.partial(self.__class__, **self.data()), ()
