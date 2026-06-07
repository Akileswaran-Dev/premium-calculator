from pydantic import BaseModel, Field

class EvaluateRequest(BaseModel):
    expression: str = Field(..., max_length=2000, description="Mathematical expression to evaluate")
    client_result: str = Field("", max_length=100, description="Optional client-side result calculation for logging/audit")

class EvaluateResponse(BaseModel):
    expression: str
    result: str
    is_error: bool
    error_message: str | None = None

class ValidateRequest(BaseModel):
    expression: str = Field(..., max_length=2000)

class ValidateResponse(BaseModel):
    expression: str
    is_valid: bool
    error_message: str | None = None
