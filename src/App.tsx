import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import OnboardingView from './components/Onboarding/OnboardingView';
import DashboardView from './components/Dashboard/DashboardView';
import AccountsView from './components/Accounts/AccountsView';
import CSVImportView from './components/CSVImport/CSVImportView';
import RebalanceView from './components/Rebalance/RebalanceView';
import SubscriptionView from './components/Subscriptions/SubscriptionView';
import TaxView from './components/Tax/TaxView';
import SettingsView from './components/Settings/SettingsView';
import MonteCarloView from './components/MonteCarlo/MonteCarloView';
import TransactionsView from './components/Transactions/TransactionsView';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const { settings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'csv' | 'rebalance' | 'subscriptions' | 'tax' | 'settings' | 'resilience' | 'transactions'>('overview');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!settings?.isSetupComplete) {
    return <OnboardingView />;
  }

  const handleNavigate = (tab: 'overview' | 'accounts' | 'csv' | 'rebalance' | 'subscriptions' | 'tax' | 'settings' | 'resilience' | 'transactions') => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardView onNavigate={handleNavigate} />;
      case 'accounts': return <AccountsView />;
      case 'csv': return <CSVImportView />;
      case 'rebalance': return <RebalanceView />;
      case 'subscriptions': return <SubscriptionView />;
      case 'tax': return <TaxView />;
      case 'settings': return <SettingsView />;
      case 'resilience': return <MonteCarloView />;
      case 'transactions': return <TransactionsView />;
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
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('overview'); }}>{t('nav.overview')}</a>
            </li>
            <li className={activeTab === 'resilience' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('resilience'); }}>{t('nav.resilience')}</a>
            </li>
            <li className={activeTab === 'accounts' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('accounts'); }}>{t('nav.accounts')}</a>
            </li>
            <li className={activeTab === 'transactions' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('transactions'); }}>{t('nav.transactions')}</a>
            </li>
            <li className={activeTab === 'rebalance' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('rebalance'); }}>{t('nav.rebalance')}</a>
            </li>
            <li className={activeTab === 'tax' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('tax'); }}>{t('nav.tax')}</a>
            </li>
            <li className={activeTab === 'subscriptions' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('subscriptions'); }}>{t('nav.subscriptions')}</a>
            </li>
            <li className={activeTab === 'csv' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('csv'); }}>{t('nav.csv')}</a>
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('settings'); }}>{t('nav.settings')}</a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>Logged in as User</p>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
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
