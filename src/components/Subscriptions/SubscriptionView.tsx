import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { detectSubscriptions } from '../../logic/engine';
import { formatCurrency } from '../../utils/formatters';
import './SubscriptionView.css';

const SubscriptionView: React.FC = () => {
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  
  const subscriptions = useMemo(() => {
    return detectSubscriptions(transactions || []);
  }, [transactions]);

  const totalMonthlyLeak = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + s.monthlyAmount, 0);
  }, [subscriptions]);

  return (
    <div className="subscriptions-container">
      <header className="subscriptions-header">
        <h1>Subscription Audit</h1>
        <p>Identify recurring expenses and plug the leaks in your financial engine.</p>
      </header>

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

      <div className="subscriptions-list card">
        <h3>Detected Recurring Expenses</h3>
        {subscriptions.length > 0 ? (
          <table className="subs-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Monthly Cost</th>
                <th>Annual Cost</th>
                <th>Frequency</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub, i) => (
                <tr key={i}>
                  <td className="sub-desc">{sub.description}</td>
                  <td className="sub-amount">{formatCurrency(sub.monthlyAmount)}</td>
                  <td className="sub-annual">{formatCurrency(sub.monthlyAmount * 12)}</td>
                  <td>{sub.count} months tracked</td>
                  <td>{new Date(sub.lastDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-msg">No recurring subscriptions detected yet. Import more data to see results.</p>
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
