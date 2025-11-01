"""
Service for managing utility company information
"""
import logging
from typing import Dict, Optional
from models.schemas import UtilityCompany
from services.s3_service import S3Service

logger = logging.getLogger(__name__)


class UtilityService:
    """Service for retrieving utility company information by zip code"""

    def __init__(self, s3_service: S3Service, utilities_file_key: str):
        """
        Initialize utility service
        
        Args:
            s3_service: Instance of S3Service for data access
            utilities_file_key: S3 key for the utilities JSON file
        """
        self.s3_service = s3_service
        self.utilities_file_key = utilities_file_key
        self._utilities_cache: Optional[Dict[str, Dict]] = None

    async def get_utility_by_zip_code(self, zip_code: str) -> UtilityCompany:
        """
        Retrieve utility company information for a given zip code
        
        Args:
            zip_code: 5 or 9 digit zip code
            
        Returns:
            UtilityCompany information
            
        Raises:
            Exception: If utility company cannot be found or retrieved
        """
        try:
            # Normalize zip code to 5 digits
            normalized_zip = self._normalize_zip_code(zip_code)
            
            # Load utilities data if not cached
            if self._utilities_cache is None:
                await self._load_utilities_data()
            
            # Look up utility company by zip code
            utility_data = self._utilities_cache.get(normalized_zip)
            
            if not utility_data:
                logger.warning(f"No utility company found for zip code: {normalized_zip}")
                # Return a default/unknown utility company
                return UtilityCompany(
                    name="Unknown Utility Company",
                    serviceArea=f"Zip Code {normalized_zip}",
                    contactInfo="Please contact your local utility provider"
                )
            
            # Parse and return utility company information
            return UtilityCompany(
                name=utility_data.get("name", "Unknown"),
                serviceArea=utility_data.get("service_area", normalized_zip),
                contactInfo=utility_data.get("contact_info")
            )
            
        except Exception as error:
            logger.error(f"Error retrieving utility company: {error}")
            raise Exception(f"Failed to retrieve utility company: {str(error)}")

    async def _load_utilities_data(self) -> None:
        """
        Load utilities data from S3 and cache it
        
        Expected format in S3 JSON file:
        {
            "12345": {
                "name": "ABC Electric Company",
                "service_area": "Metropolitan Area",
                "contact_info": "1-800-123-4567"
            },
            "67890": {
                "name": "XYZ Power Corp",
                "service_area": "Rural District",
                "contact_info": "1-800-987-6543"
            }
        }
        """
        try:
            utilities_data = await self.s3_service.read_json_file(
                self.utilities_file_key
            )
            
            # Validate that we have a dictionary
            if not isinstance(utilities_data, dict):
                logger.error("Utilities data is not in expected format (dict)")
                self._utilities_cache = {}
                return
            
            self._utilities_cache = utilities_data
            logger.info(
                f"Loaded {len(self._utilities_cache)} utility companies from S3"
            )
            
        except Exception as error:
            logger.error(f"Error loading utilities data: {error}")
            # Set empty cache to avoid repeated failed loads
            self._utilities_cache = {}
            raise Exception(f"Failed to load utilities data: {str(error)}")

    def _normalize_zip_code(self, zip_code: str) -> str:
        """
        Normalize zip code to 5 digits
        
        Args:
            zip_code: Zip code (can be 5 or 9 digits with hyphen)
            
        Returns:
            5-digit zip code string
        """
        # Remove any spaces or hyphens and take first 5 digits
        cleaned = zip_code.replace("-", "").replace(" ", "")
        return cleaned[:5]

    def clear_cache(self) -> None:
        """Clear the utilities cache to force reload on next request"""
        self._utilities_cache = None
        logger.info("Utilities cache cleared")