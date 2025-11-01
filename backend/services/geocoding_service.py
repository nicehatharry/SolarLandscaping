"""
Service for interacting with US Census Bureau Geocoding API
"""
import logging
from typing import Dict, Optional
import httpx
from models.schemas import GeocodingApiResponse, Coordinates

logger = logging.getLogger(__name__)

CENSUS_GEOCODING_BASE_URL = "https://geocoding.geo.census.gov/geocoder"


class GeocodingService:
    """Service to validate addresses using Census Bureau Geocoding API"""

    def __init__(self):
        self.base_url = CENSUS_GEOCODING_BASE_URL
        self.timeout = 10.0  # seconds

    async def validate_address(
        self,
        address: str,
        city: str,
        state: str,
        zip_code: str
    ) -> GeocodingApiResponse:
        """
        Validate an address using the Census Bureau Geocoding API
        
        Args:
            address: Street address
            city: City name
            state: Two-letter state code
            zip_code: Zip code
            
        Returns:
            GeocodingApiResponse with matched address and coordinates
            
        Raises:
            HTTPException: If the API call fails or address cannot be validated
        """
        try:
            # Construct the full address string
            full_address = f"{address}, {city}, {state} {zip_code}"
            
            # Census Bureau Geocoding API endpoint
            # Using the "onelineaddress" format for simplicity
            url = f"{self.base_url}/locations/onelineaddress"
            
            params = {
                "address": full_address,
                "benchmark": "Public_AR_Current",  # Current benchmark
                "format": "json"
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Parse the response
                matched_address, coordinates = self._parse_census_response(data)
                
                if not matched_address:
                    logger.warning(f"No match found for address: {full_address}")
                    # Return original address if no match found
                    return GeocodingApiResponse(
                        matchedAddress=full_address,
                        coordinates=Coordinates(latitude=0.0, longitude=0.0),
                        isValid=False
                    )
                
                return GeocodingApiResponse(
                    matchedAddress=matched_address,
                    coordinates=coordinates,
                    isValid=True
                )
                
        except httpx.HTTPError as error:
            logger.error(f"HTTP error during geocoding: {error}")
            raise Exception(f"Failed to validate address: {str(error)}")
        except Exception as error:
            logger.error(f"Unexpected error during geocoding: {error}")
            raise Exception(f"Address validation failed: {str(error)}")

    def _parse_census_response(
        self, 
        data: Dict
    ) -> tuple[Optional[str], Coordinates]:
        """
        Parse the Census Bureau API response
        
        Args:
            data: JSON response from Census API
            
        Returns:
            Tuple of (matched_address, coordinates)
        """
        try:
            # Check if we have any matches
            result = data.get("result", {})
            address_matches = result.get("addressMatches", [])
            
            if not address_matches:
                return None, Coordinates(latitude=0.0, longitude=0.0)
            
            # Get the first (best) match
            best_match = address_matches[0]
            
            # Extract matched address
            matched_address = best_match.get("matchedAddress", "")
            
            # Extract coordinates
            coordinates_data = best_match.get("coordinates", {})
            latitude = float(coordinates_data.get("y", 0.0))
            longitude = float(coordinates_data.get("x", 0.0))
            
            coordinates = Coordinates(
                latitude=latitude,
                longitude=longitude
            )
            
            return matched_address, coordinates
            
        except (KeyError, ValueError, TypeError) as error:
            logger.error(f"Error parsing Census API response: {error}")
            return None, Coordinates(latitude=0.0, longitude=0.0)