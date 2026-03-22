import React, { useState } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import OnboardingView from './components/Onboarding/OnboardingView';
import DashboardView from './components/Dashboard/DashboardView';
import AccountsView from './components/Accounts/AccountsView';
import CSVImportView from './components/CSVImport/CSVImportView';
import RebalanceView from './components/Rebalance/RebalanceView';

const AppContent: React.FC = () => {
  const { settings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'csv' | 'rebalance'>('overview');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!settings?.isSetupComplete) {
    return <OnboardingView />;
  }

  const handleNavigate = (tab: 'overview' | 'accounts' | 'csv' | 'rebalance') => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardView onNavigate={handleNavigate} />;
      case 'accounts': return <AccountsView />;
      case 'csv': return <CSVImportView />;
      case 'rebalance': return <RebalanceView />;
      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="dashboard-layout" style={{ width: '100%', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Reverse Engine</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('overview'); }}>Overview</a>
            </li>
            <li className={activeTab === 'accounts' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('accounts'); }}>Accounts</a>
            </li>
            <li className={activeTab === 'rebalance' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('rebalance'); }}>Rebalance</a>
            </li>
            <li className={activeTab === 'csv' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('csv'); }}>CSV Import</a>
            </li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Settings</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>Logged in as User</p>
        </div>
      </aside>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </div>
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
