import React, { useState } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import OnboardingView from './components/Onboarding/OnboardingView';
import DashboardView from './components/Dashboard/DashboardView';
import AccountsView from './components/Accounts/AccountsView';

const AppContent: React.FC = () => {
  const { settings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts'>('overview');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!settings?.isSetupComplete) {
    return <OnboardingView />;
  }

  const handleNavigate = (tab: 'overview' | 'accounts') => {
    setActiveTab(tab);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {activeTab === 'overview' ? (
        <DashboardView onNavigate={handleNavigate} />
      ) : (
        <div className="dashboard-layout" style={{ width: '100%' }}>
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <h2>Reverse Engine</h2>
            </div>
            <nav className="sidebar-nav">
              <ul>
                <li className="">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('overview'); }}>Overview</a>
                </li>
                <li className="active">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('accounts'); }}>Accounts</a>
                </li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>CSV Import</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Settings</a></li>
              </ul>
            </nav>
            <div className="sidebar-footer">
              <p>Logged in as User</p>
            </div>
          </aside>
          <AccountsView />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
