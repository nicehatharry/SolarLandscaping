// Homepage component with user information form
import React, { useState } from 'react';
import { FormInput } from './common/FormInput';
import { Button } from './common/Button';
import { validateAddress, getUtilityCompanyByZipCode } from '../services/api';
import type { UserFormData } from '../types';

interface HomePageProps {
  onFormSubmitSuccess: (data: {
    userInfo: UserFormData;
    recommendedAddress: string;
    utilityCompany: any;
  }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onFormSubmitSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    setFormData(previousFormData => ({
      ...previousFormData,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors(previousErrors => ({
        ...previousErrors,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    // Validate required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (formData.state.length !== 2) {
      newErrors.state = 'State must be a 2-letter code (e.g., CA, NY)';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Zip code must be 5 digits (e.g., 12345)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(null);

    // Validate form before making API calls
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Validate address with Census Bureau Geocoding API
      const geocodingResponse = await validateAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.zipCode
      );

      // Step 2: Get utility company information from S3
      const utilityCompany = await getUtilityCompanyByZipCode(formData.zipCode);

      // Step 3: Navigate to confirmation page with data
      onFormSubmitSuccess({
        userInfo: formData,
        recommendedAddress: geocodingResponse.matchedAddress,
        utilityCompany: utilityCompany,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setApiError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Utility Assistance Registration
        </h1>
        <p className="text-gray-600 mb-8">
          Please provide your information to check eligibility for utility assistance programs.
        </p>

        {apiError && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              placeholder="John"
              error={errors.firstName}
            />

            <FormInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              placeholder="Doe"
              error={errors.lastName}
            />
          </div>

          <FormInput
            label="Street Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="123 Main Street"
            error={errors.address}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Springfield"
                error={errors.city}
              />
            </div>

            <FormInput
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              placeholder="CA"
              maxLength={2}
              error={errors.state}
            />
          </div>

          <FormInput
            label="Zip Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
            placeholder="12345"
            maxLength={10}
            error={errors.zipCode}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
};