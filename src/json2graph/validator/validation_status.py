from dataclasses import dataclass


@dataclass
class ValidationStatus:
    name: str
    description: str | None = None
    is_success: bool | None = None
    is_error: bool | None = None
    is_warning: bool | None = None
    is_info: bool | None = None

    def __post_init__(self):
        status_fields = list(filter(lambda x: x is not None, [self.is_success, self.is_error, self.is_warning, self.is_info]))

        if not status_fields:
            raise ValueError("At least one of the is_success, is_error, is_warning, is_info should be True")
        
        if len(status_fields) > 1:
            raise ValueError("Only one of the is_success, is_error, is_warning, is_info should be True")
        
    def __str__(self):
        status_field = next(filter(lambda x: x is not None, [self.is_success, self.is_error, self.is_warning, self.is_info]))

        return f"ValidationStatus(name={self.name}, description={self.description}, {status_field}=True)"
