// Thank you page displayed after successful submission
import React from 'react';
import { Button } from './common/Button';

interface ThankYouPageProps {
  onReturnHome: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Your Submission!
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          Your information has been successfully submitted and saved.
        </p>
        
        <p className="text-base text-gray-600 mb-8">
          We will review your application and contact you within 3-5 business days 
          regarding your utility assistance eligibility. If you have any questions, 
          please don't hesitate to reach out to your utility company.
        </p>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            What Happens Next?
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Your information is being processed by our system</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Your utility company will verify your eligibility</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>You will receive confirmation via mail or email</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>If approved, assistance will be applied to your account</span>
            </li>
          </ul>
        </div>

        {/* Return to Home Button */}
        <Button
          variant="primary"
          onClick={onReturnHome}
          fullWidth
        >
          Return to Homepage
        </Button>

        {/* Support Information */}
        <p className="text-sm text-gray-500 mt-6">
          Need assistance? Contact your utility company directly or visit their 
          website for more information about assistance programs.
        </p>
      </div>
    </div>
  );
};