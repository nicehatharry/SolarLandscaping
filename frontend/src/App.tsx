// Main application component managing routing and state
import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { ConfirmationPage } from './components/ConfirmationPage';
import { ThankYouPage } from './components/ThankYouPage';
import type { UserFormData, UtilityCompany } from './types';

type AppPage = 'home' | 'confirmation' | 'thankYou';

interface ConfirmationData {
  userInfo: UserFormData;
  recommendedAddress: string;
  utilityCompany: UtilityCompany;
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

  const handleFormSubmitSuccess = (data: ConfirmationData) => {
    setConfirmationData(data);
    setCurrentPage('confirmation');
  };

  const handleCancelConfirmation = () => {
    setCurrentPage('home');
    // Optionally preserve form data for user convenience
    // For now, we'll start fresh when they return
  };

  const handleConfirmSuccess = () => {
    setCurrentPage('thankYou');
  };

  const handleReturnHome = () => {
    setCurrentPage('home');
    setConfirmationData(null);
  };

  // Render the appropriate page based on current state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onFormSubmitSuccess={handleFormSubmitSuccess} />;
      
      case 'confirmation':
        if (!confirmationData) {
          // Fallback: If somehow we're on confirmation page without data
          setCurrentPage('home');
          return null;
        }
        return (
          <ConfirmationPage
            userInfo={confirmationData.userInfo}
            recommendedAddress={confirmationData.recommendedAddress}
            utilityCompany={confirmationData.utilityCompany}
            onCancel={handleCancelConfirmation}
            onConfirmSuccess={handleConfirmSuccess}
          />
        );
      
      case 'thankYou':
        return <ThankYouPage onReturnHome={handleReturnHome} />;
      
      default:
        return <HomePage onFormSubmitSuccess={handleFormSubmitSuccess} />;
    }
  };

  return (
    <div className="app">
      {renderCurrentPage()}
    </div>
  );
}

export default App;