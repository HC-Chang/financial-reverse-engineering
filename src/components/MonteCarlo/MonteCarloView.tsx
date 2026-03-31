import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { runMonteCarlo, calculateStressGap } from '../../logic/monteCarloEngine';
import { formatCurrency } from '../../utils/formatters';
import './MonteCarloView.css';

const MonteCarloView: React.FC = () => {
  const { settings } = useSettings();
  
  const results = useMemo(() => {
    if (!settings) return null;
    return runMonteCarlo(settings);
  }, [settings]);

  const stressGap = useMemo(() => {
    if (!settings) return 0;
    return calculateStressGap(settings);
  }, [settings]);

  if (!results) return <div className="monte-carlo-container">Loading simulations...</div>;

  return (
    <div className="monte-carlo-container">
      <header className="mc-header">
        <h1>Historical Resilience</h1>
        <p>Testing your plan against every market cycle since 1926.</p>
      </header>

      <div className="mc-grid">
        <section className="score-card card">
          <div className="gauge-container">
            <div className="gauge-value">{results.resilienceScore.toFixed(1)}%</div>
            <div className="gauge-label">Resilience Score</div>
          </div>
          <p>Your plan survived {results.successCount} out of {results.totalSimulations} historical starts.</p>
        </section>

        <section className="stress-gap-card card highlight">
          <h3>The Stress Gap</h3>
          <p>To reach <strong>100% historical resilience</strong> (surviving 1929), you need:</p>
          <div className="gap-value">+{formatCurrency(stressGap)}/mo</div>
          <p className="hint">Extra investment required to disaster-proof your path.</p>
        </section>

        <section className="worst-cases-card card">
          <h3>Unluckiest Start Dates</h3>
          <div className="failure-list">
            {results.worstCases.length > 0 ? (
              results.worstCases.map(wc => (
                <div key={wc.startDate} className="failure-item">
                  <span className="era">{wc.startDate}</span>
                  <span className="reason">
                    {wc.failureReason === 'safety' ? 'Safety Margin' : 'Goal Missed'} 
                    (Year {Math.floor((wc.failureMonth || 0) / 12)})
                  </span>
                </div>
              ))
            ) : (
              <p>No failures found. Your plan is bulletproof!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MonteCarloView;
