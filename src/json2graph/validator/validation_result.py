from typing import Generic, TypeVar

from json2graph.validator.validation_status import ValidationStatus


S = TypeVar('S', bound=ValidationStatus)
T = TypeVar('T')


class ValidationResult(Generic[S, T]):
    def __init__(self, status: S, code: T | None = None, message: str | None = None):
        self.status = status
        self.code = code
        self.message = message

    def is_success(self) -> bool:
        return bool(self.status.is_success)
    
    def is_error(self) -> bool:
        return bool(self.status.is_error)
    
    def is_warning(self) -> bool:
        return bool(self.status.is_warning)
    
    def is_info(self) -> bool:
        return bool(self.status.is_info)

    def __str__(self):
        return f"ValidationResult(status={str(self.status)}, code={self.code}, message={self.message})"

    def __repr__(self):
        return str(self)
