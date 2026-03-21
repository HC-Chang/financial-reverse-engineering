import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { calculateRequiredFuel } from '../../logic/engine';
import { formatCurrency } from '../../utils/formatters';
import './DashboardView.css';

const DashboardView: React.FC = () => {
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
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Reverse Engine</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active"><a href="#">Overview</a></li>
            <li><a href="#">Accounts</a></li>
            <li><a href="#">CSV Import</a></li>
            <li><a href="#">Settings</a></li>
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
          {/* Charts will go here in later tasks */}
          <div className="placeholder-chart">
            <h3>Engine Progress</h3>
            <p>Projection details will be implemented in Task 5.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardView;
