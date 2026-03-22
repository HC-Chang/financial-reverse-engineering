import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { calculateTaxStrategy } from '../../logic/engine';
import { formatCurrency } from '../../utils/formatters';
import './TaxView.css';

const TaxView: React.FC = () => {
  const { settings } = useSettings();
  
  const strategy = useMemo(() => {
    if (!settings) return null;
    return calculateTaxStrategy(settings);
  }, [settings]);

  if (!settings || !strategy) {
    return <div>Loading tax strategy...</div>;
  }

  return (
    <div className="tax-container">
      <header className="tax-header">
        <h1>Tax Strategy & Optimization</h1>
        <p>Minimize your lifetime tax liability with engine-optimized contributions.</p>
      </header>

      <div className="tax-summary card">
        <div className="tax-metric">
          <span className="metric-label">Retirement Effective Rate</span>
          <span className="metric-value">{strategy.effectiveRate.toFixed(1)}%</span>
          <span className="metric-hint">Estimated based on target income</span>
        </div>
        <div className="tax-metric">
          <span className="metric-label">Estimated Annual Tax</span>
          <span className="metric-value">{formatCurrency(strategy.estimatedAnnualTax)}</span>
          <span className="metric-hint">In today's dollars</span>
        </div>
      </div>

      <section className="waterfall-section card">
        <h3>Contribution Waterfall</h3>
        <p>Follow this order for every dollar you invest to maximize efficiency:</p>
        <div className="waterfall-list">
          {strategy.contributionWaterfall.map((step) => (
            <div key={step.priority} className="waterfall-step">
              <div className="step-number">{step.priority}</div>
              <div className="step-icon">{step.icon}</div>
              <div className="step-details">
                <strong>{step.name}</strong>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="tax-tips card">
        <h3>Optimization Insights</h3>
        <ul>
          <li><strong>The 12% Bracket:</strong> Your current plan keeps you largely within the 12% marginal bracket in retirement. This is highly efficient.</li>
          <li><strong>Roth vs. Trad:</strong> If your current marginal tax rate is above 22%, prioritize Traditional to save now and pay later at your lower retirement rate.</li>
          <li><strong>HSA Triple Threat:</strong> If available, an HSA is the only vehicle with tax-free contributions, growth, and withdrawals for medical expenses.</li>
        </ul>
      </div>
    </div>
  );
};

export default TaxView;
