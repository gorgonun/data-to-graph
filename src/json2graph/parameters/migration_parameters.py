import uuid
from turbo_c2 import JobParameter


class MigrationParameters(JobParameter):
    migration_name: str = uuid.uuid4()
