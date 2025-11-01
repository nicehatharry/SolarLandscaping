"""
Pydantic models for request/response validation
"""
from typing import Optional
from pydantic import BaseModel, Field, validator


class AddressValidationRequest(BaseModel):
    """Request model for address validation"""
    address: str = Field(..., min_length=1, description="Street address")
    city: str = Field(..., min_length=1, description="City name")
    state: str = Field(..., min_length=2, max_length=2, description="2-letter state code")
    zip_code: str = Field(..., alias="zipCode", description="5 or 9 digit zip code")

    @validator('state')
    def validate_state_code(cls, value):
        """Ensure state is uppercase 2-letter code"""
        return value.upper()

    class Config:
        populate_by_name = True


class Coordinates(BaseModel):
    """Geographic coordinates"""
    latitude: float
    longitude: float


class GeocodingApiResponse(BaseModel):
    """Response model for geocoding validation"""
    matched_address: str = Field(..., alias="matchedAddress")
    coordinates: Coordinates
    is_valid: bool = Field(..., alias="isValid")

    class Config:
        populate_by_name = True


class UtilityCompany(BaseModel):
    """Utility company information"""
    name: str
    zipCode: str

    class Config:
        populate_by_name = True


class UserFormData(BaseModel):
    """User form data"""
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    address: str
    city: str
    state: str
    zip_code: str = Field(..., alias="zipCode")

    class Config:
        populate_by_name = True


class ConfirmationData(BaseModel):
    """Complete confirmation data for submission"""
    user_info: UserFormData = Field(..., alias="userInfo")
    recommended_address: str = Field(..., alias="recommendedAddress")
    utility_company: UtilityCompany = Field(..., alias="utilityCompany")
    assistance_program: str = Field(..., alias="assistanceProgram")

    @validator('assistance_program')
    def validate_assistance_program(cls, value):
        """Ensure assistance program is one of the allowed values"""
        allowed_values = ['SNAP', 'Medicaid', 'None']
        if value not in allowed_values:
            raise ValueError(f'Assistance program must be one of {allowed_values}')
        return value

    class Config:
        populate_by_name = True


class SubmissionResponse(BaseModel):
    """Response after successful submission"""
    success: bool
    message: str