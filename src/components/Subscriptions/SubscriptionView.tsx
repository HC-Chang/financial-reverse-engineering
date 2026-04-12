import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/database';
import { useSettings } from '../../context/SettingsContext';
import { detectSubscriptions, calculateRequiredFuel } from '../../logic/engine';
import { formatCurrency } from '../../utils/formatters';
import './SubscriptionView.css';

const SubscriptionView: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const confirmedSubscriptions = useLiveQuery(() => db.subscriptions.toArray(), []);

  // Use useEffect to run detection and save to DB
  useEffect(() => {
    const runDetection = async () => {
      if (!transactions || transactions.length === 0) return;
      
      const detected = detectSubscriptions(transactions);
      
      for (const sub of detected) {
        const existing = await db.subscriptions
          .where('description')
          .equals(sub.description)
          .first();
          
        if (!existing) {
          await db.subscriptions.add(sub);
        } else if (existing.status === 'Detected') {
          // Update count/lastDate if still in detected state
          await db.subscriptions.update(existing.id!, {
            count: sub.count,
            lastDate: sub.lastDate,
            monthlyAmount: sub.monthlyAmount
          });
        }
      }
    };
    
    runDetection();
  }, [transactions]);

  const pendingSubscriptions = useMemo(() => {
    return confirmedSubscriptions?.filter(s => s.status === 'Detected') || [];
  }, [confirmedSubscriptions]);

  const activeSubscriptions = useMemo(() => {
    return confirmedSubscriptions?.filter(s => s.status === 'Confirmed') || [];
  }, [confirmedSubscriptions]);

  // Calculate "Days to Freedom" impact of a subscription
  const calculateImpact = (monthlyAmount: number) => {
    if (!settings) return 0;
    const currentResults = calculateRequiredFuel(settings);
    
    // Calculate fuel with the subscription "plugged" (removed from expenses)
    // In our engine, this means the user needs LESS target income
    const reducedIncome = settings.targetMonthlyIncome - (monthlyAmount);
    const optimizedResults = calculateRequiredFuel({
      ...settings,
      targetMonthlyIncome: reducedIncome
    });

    return Math.max(0, currentResults.daysToFreedom - optimizedResults.daysToFreedom);
  };

  const totalMonthlyLeak = activeSubscriptions.reduce((sum, s) => sum + s.monthlyAmount, 0);
  const totalImpact = calculateImpact(totalMonthlyLeak);

  const handleConfirm = async (id: number) => {
    await db.subscriptions.update(id, { status: 'Confirmed' });
  };

  const handleDismiss = async (id: number) => {
    await db.subscriptions.update(id, { status: 'Dismissed' });
  };

  const handleDelete = async (id: number) => {
    await db.subscriptions.delete(id);
  };

  return (
    <div className="subscriptions-container">
      <header className="subscriptions-header">
        <h1>{t('subscriptions.title')}</h1>
        <p>{t('subscriptions.subtitle')}</p>
      </header>

      <div className="leak-summary-grid">
        <div className="stat-card leak-summary">
          <div className="stat-metric">
            <span className="stat-label">{t('dashboard.confirmedLeak')}</span>
            <span className="stat-value" style={{ color: '#e74c3c' }}>{formatCurrency(totalMonthlyLeak)}</span>
            <p className="hint">{t('dashboard.leakHint')}</p>
          </div>
        </div>

        <div className="stat-card freedom-impact-card">
          <div className="impact-header">
            <span className="impact-icon">🚀</span>
            <span className="impact-label">{t('subscriptions.impact')}</span>
          </div>
          <div className="impact-value">+{totalImpact} Days</div>
          <p className="impact-hint">If you cancelled these subscriptions today.</p>
        </div>
      </div>

      {pendingSubscriptions.length > 0 && (
        <section className="pending-section card" style={{ marginBottom: '2rem' }}>
          <h3>{t('subscriptions.detected')} ({pendingSubscriptions.length})</h3>
          <div className="pending-grid">
            {pendingSubscriptions.map(sub => (
              <div key={sub.id} className="pending-card">
                <div className="pending-info">
                  <span className="sub-desc">{sub.description}</span>
                  <span className="sub-amount">{formatCurrency(sub.monthlyAmount)}/mo</span>
                  <div className="confidence-meter" title={`Confidence: ${sub.confidence * 100}%`}>
                    <div className="confidence-bar" style={{ width: `${sub.confidence * 100}%` }}></div>
                  </div>
                </div>
                <div className="pending-actions">
                  <button onClick={() => handleConfirm(sub.id!)} className="confirm-btn">{t('common.confirm')}</button>
                  <button onClick={() => handleDismiss(sub.id!)} className="dismiss-btn">{t('common.dismiss')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="subscriptions-list card">
        <h3>{t('subscriptions.confirmed')}</h3>
        {activeSubscriptions.length > 0 ? (
          <table className="subs-table">
            <thead>
              <tr>
                <th>{t('transactions.description')}</th>
                <th>Frequency</th>
                <th>{t('transactions.amount')}</th>
                <th>Last Date</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {activeSubscriptions.map(sub => (
                <tr key={sub.id}>
                  <td className="sub-desc">{sub.description}</td>
                  <td>{sub.frequency}</td>
                  <td className="sub-amount">{formatCurrency(sub.monthlyAmount)}/mo</td>
                  <td>{new Date(sub.lastDate).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(sub.id!)} className="action-link danger">{t('common.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-msg">{t('common.noData')}</p>
        )}
      </section>

      <div className="audit-tips card" style={{ marginTop: '2rem' }}>
        <h3>Engine Audit Logic</h3>
        <ul>
          <li><strong>Recurring Signatures:</strong> The engine flags transactions with similar descriptions and amounts that repeat on a fixed interval.</li>
          <li><strong>Opportunity Cost:</strong> Every $100/mo in subscriptions requires an additional $30,000 in your net worth goal (using the 4% rule).</li>
          <li><strong>Silent Leaks:</strong> Subscriptions are the biggest "fuel leaks" because they often continue long after their utility has expired.</li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionView;
