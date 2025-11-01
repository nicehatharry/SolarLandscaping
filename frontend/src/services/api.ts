// API service layer for communicating with the backend
import type {  
  GeocodingApiResponse, 
  UtilityCompany, 
  ConfirmationData 
} from '../types';

const API_BASE_URL = 'http://localhost:8000'; // import.meta.env.VITE_API_BASE_URL ||

/**
 * Validates an address using the US Census Bureau Geocoding API
 * Returns the recommended address and validation status
 */
export async function validateAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<GeocodingApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/validate-address`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, city, state, zipCode }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to validate address');
  }

  return response.json();
}

/**
 * Retrieves utility company information for a given zip code
 * Data is fetched from AWS S3 storage
 */
export async function getUtilityCompanyByZipCode(
  zipCode: string
): Promise<UtilityCompany> {
  const response = await fetch(
    `${API_BASE_URL}/api/utility-company/${zipCode}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to retrieve utility company');
  }

  return response.json();
}

/**
 * Submits confirmed user information to be stored in AWS S3
 * Appends data to the subscriber_info.json file
 */
export async function submitSubscriberInformation(
  confirmationData: ConfirmationData
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/submit-subscriber`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(confirmationData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit subscriber information');
  }

  return response.json();
}