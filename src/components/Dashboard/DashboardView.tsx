import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/database';
import { useSettings } from '../../context/SettingsContext';
import { calculateRequiredFuel } from '../../logic/engine';
import { runMonteCarlo } from '../../logic/monteCarloEngine';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import AreaChart from '../Common/AreaChart';
import './DashboardView.css';

interface DashboardViewProps {
  onNavigate: (tab: 'overview' | 'accounts' | 'resilience' | 'transactions' | 'subscriptions') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(5).toArray(), []);
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray(), []);

  const totalBalance = useMemo(() => {
    return (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const results = useMemo(() => {
    if (!settings) return null;
    return calculateRequiredFuel(settings, totalBalance);
  }, [settings, totalBalance]);

  const originalFuel = useMemo(() => {
    if (!settings) return 0;
    return calculateRequiredFuel(settings).monthlyFuel;
  }, [settings]);

  const mcResults = useMemo(() => {
    if (!settings) return null;
    return runMonteCarlo(settings, undefined, undefined, totalBalance);
  }, [settings, totalBalance]);

  const pendingSubsCount = useMemo(() => {
    return subscriptions?.filter(s => s.status === 'Detected').length || 0;
  }, [subscriptions]);

  const totalMonthlyLeak = useMemo(() => {
    return subscriptions?.filter(s => s.status === 'Confirmed')
      .reduce((sum, s) => sum + s.monthlyAmount, 0) || 0;
  }, [subscriptions]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.projection.map((p, i) => ({
      x: i,
      y: p.balance,
      label: new Date(p.date).toLocaleDateString()
    }));
  }, [results]);

  if (!settings || !results || !mcResults) {
    return <div>Loading...</div>;
  }

  const { monthlyFuel, netWorthGoal } = results;
  const { resilienceScore } = mcResults;

  return (
    <main className="dashboard-content">
      <header className="dashboard-header">
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </header>

      {pendingSubsCount > 0 && (
        <section className="alert-banner warning" onClick={() => onNavigate('subscriptions')} style={{ cursor: 'pointer' }}>
          <span className="alert-icon">🕵️</span>
          <div className="alert-text">
            <strong>{pendingSubsCount} New Potential Subscriptions Detected.</strong>
            <span>Review these in the Subscription Audit to plug leaks.</span>
          </div>
          <span className="alert-action">View Audit →</span>
        </section>
      )}

      <section className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">{t('dashboard.totalAssets')}</span>
          <span className="stat-value">{formatCurrency(totalBalance)}</span>
          <span className="stat-hint">{t('dashboard.resilienceHint')}</span>
        </div>

        <div className="stat-card highlight">
          <span className="stat-label">{t('dashboard.historicalResilience')}</span>
          <span className="stat-value">{resilienceScore.toFixed(1)}%</span>
          <span className="stat-hint">{t('dashboard.resilienceHint')}</span>
          <button 
            className="action-link" 
            onClick={() => onNavigate('resilience')}
          >
            Run stress tests →
          </button>
        </div>

        <div className="stat-card highlight">
          <span className="stat-label">{t('dashboard.monthlyFuel')}</span>
          <span className="stat-value">{formatCurrency(monthlyFuel)}</span>
          <div className="drift-indicator">
            {monthlyFuel < originalFuel ? (
              <span className="drift-tag ahead">
                ▼ {formatCurrency(originalFuel - monthlyFuel)} {t('dashboard.ahead')}
              </span>
            ) : monthlyFuel > originalFuel ? (
              <span className="drift-tag lagging">
                ▲ {formatCurrency(monthlyFuel - originalFuel)} {t('dashboard.lagging')}
              </span>
            ) : (
              <span className="drift-tag on-track">{t('dashboard.onTrack')}</span>
            )}
          </div>
          <span className="stat-hint">{t('dashboard.fuelHint')}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">{t('dashboard.confirmedLeak')}</span>
          <span className="stat-value" style={{ color: totalMonthlyLeak > 0 ? '#e74c3c' : 'inherit' }}>
            {formatCurrency(totalMonthlyLeak)}
          </span>
          <span className="stat-hint">{t('dashboard.leakHint')}</span>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-column card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{t('dashboard.recentTransactions')}</h3>
            <button className="action-link" onClick={() => onNavigate('transactions')}>{t('dashboard.viewAll')}</button>
          </div>
          {transactions && transactions.length > 0 ? (
            <div className="mini-transactions">
              {transactions.map(t => (
                <div key={t.id} className="mini-t-row">
                  <div className="t-info">
                    <span className="t-desc">{t.description}</span>
                    <span className="t-date">{new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`t-amount ${t.amount < 0 ? 'expense' : 'income'}`}>
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-msg">No transactions yet. <button onClick={() => onNavigate('transactions')}>Import CSV</button></p>
          )}
        </section>

        <section className="dashboard-column card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{t('dashboard.accountBalances')}</h3>
            <button className="action-link" onClick={() => onNavigate('accounts')}>{t('dashboard.manage')}</button>
          </div>
          {accounts && accounts.length > 0 ? (
            <div className="mini-accounts">
              {accounts.map(acc => (
                <div key={acc.id} className="mini-acc-row">
                  <span className="acc-name">{acc.name}</span>
                  <span className="acc-balance">{formatCurrency(acc.balance)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-msg">No accounts added. <button onClick={() => onNavigate('accounts')}>Add Account</button></p>
          )}
        </section>
      </div>

      <section className="dashboard-charts card" style={{ marginTop: '1.5rem' }}>
        <h3>{t('dashboard.wealthProjection')}</h3>
        <div style={{ height: '250px', marginTop: '1rem' }}>
          <AreaChart data={chartData} height={250} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.8rem' }}>
          <span>{t('dashboard.today')}</span>
          <span>{t('dashboard.goal')} ({formatCurrency(netWorthGoal)})</span>
        </div>
      </section>
    </main>
  );
};

export default DashboardView;
