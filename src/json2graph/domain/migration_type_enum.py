from enum import Enum


class MigrationType(str, Enum):
    ONE_TIME = "one-time"
    CONTINUOUS = "continuous"
