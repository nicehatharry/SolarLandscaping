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
          Curious what makes this page go? Check out the <a href='https://github.com/nicehatharry/SolarLandscaping'>GitHub repository</a>!
        </p>
      </div>
    </div>
  );
};