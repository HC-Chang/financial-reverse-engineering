import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useSettings } from '../../context/SettingsContext';
import { calculateRequiredFuel } from '../../logic/engine';
import { runMonteCarlo } from '../../logic/monteCarloEngine';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import AreaChart from '../Common/AreaChart';
import { Subscription } from '../../types/financial';
import './DashboardView.css';

interface DashboardViewProps {
  onNavigate: (tab: 'overview' | 'accounts' | 'resilience' | 'transactions' | 'subscriptions') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(5).toArray(), []);
  const subscriptions = useLiveQuery(() => db.subscriptions.toArray(), []);

  const results = useMemo(() => {
    if (!settings) return null;
    return calculateRequiredFuel(settings);
  }, [settings]);

  const mcResults = useMemo(() => {
    if (!settings) return null;
    return runMonteCarlo(settings);
  }, [settings]);

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

  const { monthlyFuel, netWorthGoal, daysToFreedom } = results;
  const { resilienceScore } = mcResults;

  const totalBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <main className="dashboard-content">
      <header className="dashboard-header">
        <h1>Financial Overview</h1>
        <p>Your path to freedom is mapped out.</p>
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
          <span className="stat-label">Total Assets</span>
          <span className="stat-value">{formatCurrency(totalBalance)}</span>
          <span className="stat-hint">Sum of all tracked accounts</span>
        </div>

        <div className="stat-card highlight">
          <span className="stat-label">Historical Resilience</span>
          <span className="stat-value">{resilienceScore.toFixed(1)}%</span>
          <span className="stat-hint">Success rate vs. every market cycle</span>
          <button 
            className="action-link" 
            onClick={() => onNavigate('resilience')}
          >
            Run stress tests →
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-label">Monthly Fuel Required</span>
          <span className="stat-value">{formatCurrency(monthlyFuel)}</span>
          <span className="stat-hint">Amount you need to invest monthly</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Confirmed Leak</span>
          <span className="stat-value" style={{ color: totalMonthlyLeak > 0 ? '#e74c3c' : 'inherit' }}>
            {formatCurrency(totalMonthlyLeak)}
          </span>
          <span className="stat-hint">Total monthly recurring expenses</span>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-column card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Transactions</h3>
            <button className="action-link" onClick={() => onNavigate('transactions')}>View All</button>
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
            <h3 style={{ margin: 0 }}>Account Balances</h3>
            <button className="action-link" onClick={() => onNavigate('accounts')}>Manage</button>
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
        <h3>Wealth Projection</h3>
        <div style={{ height: '250px', marginTop: '1rem' }}>
          <AreaChart data={chartData} height={250} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.8rem' }}>
          <span>Today</span>
          <span>Goal ({formatCurrency(netWorthGoal)})</span>
        </div>
      </section>
    </main>
  );
};

export default DashboardView;
