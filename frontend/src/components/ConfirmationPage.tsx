// Confirmation page for reviewing and confirming user information
import React, { useState } from 'react';
import { Button } from './common/Button';
import { submitSubscriberInformation } from '../services/api';
import type { UserFormData, UtilityCompany, AssistanceProgram } from '../types';

interface ConfirmationPageProps {
  userInfo: UserFormData;
  recommendedAddress: string;
  utilityCompany: UtilityCompany;
  onCancel: () => void;
  onConfirmSuccess: () => void;
}

const ASSISTANCE_PROGRAM_OPTIONS: AssistanceProgram[] = [
  { value: 'SNAP', label: 'SNAP (Supplemental Nutrition Assistance Program)' },
  { value: 'Medicaid', label: 'Medicaid' },
  { value: 'None', label: 'None' },
];

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  userInfo,
  recommendedAddress,
  utilityCompany,
  onCancel,
  onConfirmSuccess,
}) => {
  const [selectedAssistanceProgram, setSelectedAssistanceProgram] = 
    useState<AssistanceProgram['value']>('None');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAssistanceProgramChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedAssistanceProgram(event.target.value as AssistanceProgram['value']);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitSubscriberInformation({
        userInfo,
        recommendedAddress,
        utilityCompany,
        assistanceProgram: selectedAssistanceProgram,
      });

      onConfirmSuccess();
    } catch (error) {
      console.error('Confirmation submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to submit your information. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Confirm Your Information
        </h1>
        <p className="text-gray-600 mb-8">
          Please review your information and select any applicable assistance programs.
        </p>

        {submitError && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-red-800 font-medium">Submission Error</p>
            <p className="text-red-700 text-sm mt-1">{submitError}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information Section */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">First Name</dt>
                <dd className="mt-1 text-base text-gray-900">{userInfo.firstName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                <dd className="mt-1 text-base text-gray-900">{userInfo.lastName}</dd>
              </div>
            </dl>
          </section>

          {/* Address Information Section */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Address Information
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Recommended Address (US Census Bureau)
              </h3>
              <p className="text-base text-blue-800">{recommendedAddress}</p>
            </div>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Original Address</dt>
                <dd className="mt-1 text-base text-gray-900">{userInfo.address}</dd>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="mt-1 text-base text-gray-900">{userInfo.city}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">State</dt>
                  <dd className="mt-1 text-base text-gray-900">{userInfo.state}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Zip Code</dt>
                  <dd className="mt-1 text-base text-gray-900">{userInfo.zipCode}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Utility Company Section */}
          <section className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Utility Company
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-base text-gray-900 font-medium">
                {utilityCompany.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Service Area: {utilityCompany.serviceArea}
              </p>
              {utilityCompany.contactInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  Contact: {utilityCompany.contactInfo}
                </p>
              )}
            </div>
          </section>

          {/* Assistance Programs Section */}
          <section className="pb-6">
            <label 
              htmlFor="assistance-program-select"
              className="block text-xl font-semibold text-gray-900 mb-4"
            >
              Assistance Programs
            </label>
            <select
              id="assistance-program-select"
              value={selectedAssistanceProgram}
              onChange={handleAssistanceProgramChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            >
              {ASSISTANCE_PROGRAM_OPTIONS.map(program => (
                <option key={program.value} value={program.value}>
                  {program.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Select any assistance program you are currently enrolled in.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            fullWidth
          >
            Cancel and Go Back
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
          >
            Confirm and Submit
          </Button>
        </div>
      </div>
    </div>
  );
};