from pydantic import BaseModel


class J2GValidatorValidateDataParameters(BaseModel):
    data_destination_queue: str
    neo4j_url: str
    neo4j_user: str
    neo4j_password: str
