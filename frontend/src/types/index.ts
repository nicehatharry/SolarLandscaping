export interface UserFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface GeocodingApiResponse {
  matchedAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isValid: boolean;
}

export interface UtilityCompany {
  name: string;
  serviceArea: string;
  contactInfo?: string;
}

export interface AssistanceProgram {
  value: 'SNAP' | 'Medicaid' | 'None';
  label: string;
}

export interface ConfirmationData {
  userInfo: UserFormData;
  recommendedAddress: string;
  utilityCompany: UtilityCompany;
  assistanceProgram: AssistanceProgram['value'];
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: string;
}