import React, { useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useSettings } from '../../context/SettingsContext';
import { detectSubscriptions, calculateRequiredFuel, calculateMonthsToGoal } from '../../logic/engine';
import { formatCurrency } from '../../utils/formatters';
import { Subscription } from '../../types/financial';
import './SubscriptionView.css';

const SubscriptionView: React.FC = () => {
  const { settings } = useSettings();
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const confirmedSubs = useLiveQuery(() => db.subscriptions.toArray(), []);

  // Detect new ones and sync with DB
  useEffect(() => {
    if (!transactions) return;
    
    const detected = detectSubscriptions(transactions);
    
    detected.forEach(async (sub) => {
      const existing = confirmedSubs?.find(s => s.description === sub.description);
      if (!existing) {
        await db.subscriptions.add({
          description: sub.description,
          monthlyAmount: sub.monthlyAmount,
          frequency: sub.frequency,
          status: 'Detected',
          lastDate: sub.lastDate,
          category: sub.category,
          confidence: sub.confidence,
          count: sub.count
        });
      }
    });
  }, [transactions, confirmedSubs]);

  const activeSubs = confirmedSubs?.filter(s => s.status === 'Confirmed') || [];
  const pendingSubs = confirmedSubs?.filter(s => s.status === 'Detected') || [];

  const totalMonthlyLeak = useMemo(() => {
    return activeSubs.reduce((sum, s) => sum + s.monthlyAmount, 0);
  }, [activeSubs]);

  const freedomImpact = useMemo(() => {
    if (!settings || totalMonthlyLeak === 0) return null;
    
    const results = calculateRequiredFuel(settings);
    const { monthlyFuel, netWorthGoal } = results;
    const { initialAssets, annualReturn } = settings;

    const baseMonths = calculateMonthsToGoal(initialAssets, monthlyFuel, netWorthGoal, annualReturn);
    const optimizedMonths = calculateMonthsToGoal(initialAssets, monthlyFuel + totalMonthlyLeak, netWorthGoal, annualReturn);
    
    const monthsSaved = baseMonths - optimizedMonths;
    const daysSaved = Math.round(monthsSaved * 30.437); // Average days in month

    return {
      monthsSaved: Math.round(monthsSaved * 10) / 10,
      daysSaved
    };
  }, [settings, totalMonthlyLeak]);

  const handleStatusChange = async (id: number, status: 'Confirmed' | 'Dismissed') => {
    await db.subscriptions.update(id, { status });
  };

  const handleUndoDismiss = async (id: number) => {
    await db.subscriptions.update(id, { status: 'Detected' });
  };

  return (
    <div className="subscriptions-container">
      <header className="subscriptions-header">
        <h1>Subscription Audit</h1>
        <p>Identify recurring expenses and plug the leaks in your financial engine.</p>
      </header>

      <div className="leak-summary-grid">
        <div className="leak-summary card">
          <div className="leak-item">
            <span className="leak-label">Monthly Leak</span>
            <span className="leak-value">{formatCurrency(totalMonthlyLeak)}</span>
          </div>
          <div className="leak-item">
            <span className="leak-label">Annual Impact</span>
            <span className="leak-value highlight">{formatCurrency(totalMonthlyLeak * 12)}</span>
          </div>
        </div>

        {freedomImpact && freedomImpact.daysSaved > 0 && (
          <div className="freedom-impact-card card highlight">
            <div className="impact-header">
              <span className="impact-icon">🚀</span>
              <span className="impact-label">Engine Optimization Gain</span>
            </div>
            <div className="impact-value">
              {freedomImpact.monthsSaved >= 1 
                ? `${freedomImpact.monthsSaved} Months` 
                : `${freedomImpact.daysSaved} Days`}
            </div>
            <p className="impact-hint">You reach your goal sooner if you redirect these leaks into your "Monthly Fuel".</p>
          </div>
        )}
      </div>

      {pendingSubs.length > 0 && (
        <div className="subscriptions-list card pending-section">
          <h3>New Potential Subscriptions Detected</h3>
          <p className="hint">Confirm these to track their impact on your freedom date.</p>
          <div className="pending-grid">
            {pendingSubs.map((sub) => (
              <div key={sub.id} className="pending-card">
                <div className="pending-info">
                  <strong>{sub.description}</strong>
                  <span>{formatCurrency(sub.monthlyAmount)} / mo ({sub.frequency})</span>
                  <div className="confidence-meter">
                    <div className="confidence-bar" style={{ width: `${sub.confidence * 100}%` }}></div>
                    <span className="confidence-label">Confidence: {Math.round(sub.confidence * 100)}%</span>
                  </div>
                </div>
                <div className="pending-actions">
                  <button onClick={() => handleStatusChange(sub.id!, 'Confirmed')} className="confirm-btn">Confirm</button>
                  <button onClick={() => handleStatusChange(sub.id!, 'Dismissed')} className="dismiss-btn">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="subscriptions-list card">
        <h3>Confirmed Recurring Expenses</h3>
        {activeSubs.length > 0 ? (
          <table className="subs-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Monthly Cost</th>
                <th>Frequency</th>
                <th>Last Seen</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeSubs.map((sub) => (
                <tr key={sub.id}>
                  <td className="sub-desc">{sub.description}</td>
                  <td className="sub-amount">{formatCurrency(sub.monthlyAmount)}</td>
                  <td>{sub.frequency}</td>
                  <td>{new Date(sub.lastDate).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleStatusChange(sub.id!, 'Dismissed')} className="action-link danger">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-msg">No confirmed subscriptions yet. Use the "Detected" section above to add them.</p>
        )}
      </div>

      <div className="audit-tips card">
        <h3>Engine Optimization Tips</h3>
        <ul>
          <li><strong>Consolidate:</strong> Check for overlapping services (e.g., multiple streaming platforms).</li>
          <li><strong>Audit:</strong> Look for "ghost" subscriptions you no longer use.</li>
          <li><strong>Annualize:</strong> Always view costs in annual terms to see their true impact on your freedom date.</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionView;
