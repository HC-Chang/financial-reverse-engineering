import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { calculateRequiredFuel } from '../../logic/engine';
import { formatCurrency } from '../../utils/formatters';
import './DashboardView.css';

interface DashboardViewProps {
  onNavigate: (tab: 'overview' | 'accounts') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  const results = useMemo(() => {
    if (!settings) return null;
    return calculateRequiredFuel(settings);
  }, [settings]);

  if (!settings || !results) {
    return <div>Loading...</div>;
  }

  const { monthlyFuel, netWorthGoal, daysToFreedom } = results;

  return (
    <div className="dashboard-layout" style={{ width: '100%' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Reverse Engine</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('overview'); }}>Overview</a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('accounts'); }}>Accounts</a>
            </li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>CSV Import</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Settings</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>Logged in as User</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Financial Overview</h1>
          <p>Your path to freedom is mapped out.</p>
        </header>

        <section className="stat-cards">
          <div className="stat-card">
            <span className="stat-label">Monthly Fuel Required</span>
            <span className="stat-value">{formatCurrency(monthlyFuel)}</span>
            <span className="stat-hint">Amount you need to invest monthly</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Net Worth Goal</span>
            <span className="stat-value">{formatCurrency(netWorthGoal)}</span>
            <span className="stat-hint">Your target for independence</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Days to Freedom</span>
            <span className="stat-value">{daysToFreedom.toLocaleString()}</span>
            <span className="stat-hint">Time left until your finish line</span>
          </div>
        </section>

        <section className="dashboard-charts">
          <div className="projection-container">
            <h3>Engine Progress (Milestones)</h3>
            <div className="projection-table-wrapper">
              <table className="projection-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Projected Balance</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {results.projection
                    .filter((_, index) => index % 12 === 0 || index === results.projection.length - 1)
                    .map((point, index) => (
                      <tr key={index}>
                        <td>{new Date(point.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</td>
                        <td>{formatCurrency(point.balance)}</td>
                        <td>
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${Math.min(100, (point.balance / results.netWorthGoal) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardView;
