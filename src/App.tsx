import React from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import OnboardingView from './components/Onboarding/OnboardingView';
import DashboardView from './components/Dashboard/DashboardView';

const AppContent: React.FC = () => {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!settings?.isSetupComplete) {
    return <OnboardingView />;
  }

  return <DashboardView />;
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
