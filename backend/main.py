"""
FastAPI backend application for customer registration
"""
import logging
import os
from datetime import datetime
from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import (
    AddressValidationRequest,
    GeocodingApiResponse,
    UtilityCompany,
    ConfirmationData,
    SubmissionResponse
)
from services.geocoding_service import GeocodingService
from services.s3_service import S3Service
from services.utility_service import UtilityService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="Solar Landscape Demo",
    description="API for Solar Landscape customer registration",
    version="0.0.1"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default dev server
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
geocoding_service = GeocodingService()

s3_service = S3Service(
    bucket_name=os.getenv("AWS_S3_BUCKET_NAME"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1")
)

utility_service = UtilityService(
    s3_service=s3_service,
    utilities_file_key=os.getenv("UTILITIES_FILE_KEY")
)

SUBSCRIBER_INFO_FILE_KEY = os.getenv("SUBSCRIBER_FILE_KEY")


@app.get("/")
async def root() -> Dict[str, str]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Customer Registration API is running"
    }


@app.post("/api/validate-address", response_model=GeocodingApiResponse)
async def validate_address(request: AddressValidationRequest) -> GeocodingApiResponse:
    """
    Validate an address using the US Census Bureau Geocoding API
    
    Args:
        request: Address validation request containing street, city, state, zip
        
    Returns:
        GeocodingApiResponse with matched address and validation status
        
    Raises:
        HTTPException: If validation fails
    """
    try:
        logger.info(
            f"Validating address: {request.address}, "
            f"{request.city}, {request.state} {request.zip_code}"
        )
        
        result = await geocoding_service.validate_address(
            address=request.address,
            city=request.city,
            state=request.state,
            zip_code=request.zip_code
        )
        
        logger.info(f"Address validation successful: {result.matched_address}")
        return result
        
    except Exception as error:
        logger.error(f"Address validation failed: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Address validation failed: {str(error)}"
        )


@app.get("/api/utility-company/{zip_code}", response_model=UtilityCompany)
async def get_utility_company(zip_code: str) -> UtilityCompany:
    """
    Retrieve utility company information for a zip code
    
    Args:
        zip_code: 5 or 9 digit zip code
        
    Returns:
        UtilityCompany information
        
    Raises:
        HTTPException: If utility company cannot be found
    """
    try:
        logger.info(f"Retrieving utility company for zip code: {zip_code}")
        
        utility_company = await utility_service.get_utility_by_zip_code(zip_code)
        
        logger.info(f"Found utility company: {utility_company.name}")
        return utility_company
        
    except Exception as error:
        logger.error(f"Failed to retrieve utility company: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve utility company: {str(error)}"
        )


@app.post("/api/submit-subscriber", response_model=SubmissionResponse)
async def submit_subscriber(data: ConfirmationData) -> SubmissionResponse:
    """
    Submit confirmed subscriber information to S3 storage
    
    Args:
        data: Complete confirmation data including user info and selections
        
    Returns:
        SubmissionResponse indicating success
        
    Raises:
        HTTPException: If submission fails
    """
    try:
        logger.info(
            f"Submitting subscriber: "
            f"{data.user_info.first_name} {data.user_info.last_name}"
        )
        
        # Prepare submission data with timestamp
        submission_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_info": {
                "first_name": data.user_info.first_name,
                "last_name": data.user_info.last_name,
                "address": data.user_info.address,
                "city": data.user_info.city,
                "state": data.user_info.state,
                "zip_code": data.user_info.zip_code
            },
            "recommended_address": data.recommended_address,
            "utility_company": {
                "name": data.utility_company.name,
                "zip_code": data.utility_company.zip_code
            },
            "assistance_program": data.assistance_program
        }
        
        # Append to S3 file
        await s3_service.append_to_json_array(
            SUBSCRIBER_INFO_FILE_KEY,
            submission_record
        )
        
        logger.info("Subscriber information submitted successfully")
        
        return SubmissionResponse(
            success=True,
            message="Your information has been successfully submitted"
        )
        
    except Exception as error:
        logger.error(f"Failed to submit subscriber information: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit information: {str(error)}"
        )


@app.post("/api/admin/clear-utility-cache")
async def clear_utility_cache() -> Dict[str, str]:
    """
    Admin endpoint to clear the utility company cache
    This forces a reload from S3 on the next request
    """
    try:
        utility_service.clear_cache()
        return {"status": "success", "message": "Utility cache cleared"}
    except Exception as error:
        logger.error(f"Failed to clear cache: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear cache: {str(error)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )