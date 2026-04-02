import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { runMonteCarlo, calculateStressGap, calculateStressDelay } from '../../logic/monteCarloEngine';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import './MonteCarloView.css';

const HISTORICAL_CONTEXT: Record<string, string> = {
  '1929': 'The Great Depression',
  '1930': 'The Great Depression',
  '1931': 'The Great Depression',
  '1937': 'Recession of 1937',
  '1968': 'Late 60s Bear Market',
  '1972': 'Stagflation / Oil Crisis',
  '1973': 'Stagflation / Oil Crisis',
  '1974': 'Stagflation / Oil Crisis',
  '1987': 'Black Monday',
  '1999': 'Dot-com Bubble Peak',
  '2000': 'Dot-com Bubble Burst',
  '2001': 'Dot-com Bubble / 9/11',
  '2007': 'Global Financial Crisis',
  '2008': 'Global Financial Crisis',
};

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

  const stressDelay = useMemo(() => {
    if (!settings) return 0;
    return calculateStressDelay(settings);
  }, [settings]);

  const targetNetWorth = useMemo(() => {
    if (!settings) return 0;
    return (settings.targetMonthlyIncome * 12) / (settings.withdrawalRate / 100);
  }, [settings]);

  if (!results) return <div className="monte-carlo-container">Loading simulations...</div>;

  const getHistoricalEvent = (dateStr: string) => {
    const year = dateStr.split('-')[0];
    return HISTORICAL_CONTEXT[year];
  };

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

        <section className="resilience-range-card card">
          <h3>Outcome Distribution</h3>
          <p>Final balances adjusted for historical inflation.</p>
          <div className="range-visual">
            <div className="range-bar-container">
              <div className="range-bar">
                <div className="marker median" style={{ left: `${Math.min(100, (results.medianBalance / results.bestCases[0].finalBalance) * 100)}%` }}>
                  <span className="marker-label">Median: {formatCurrency(results.medianBalance)}</span>
                </div>
                <div className="marker goal" style={{ left: `${Math.min(100, (targetNetWorth / results.bestCases[0].finalBalance) * 100)}%` }}>
                  <span className="marker-label">Goal: {formatCurrency(targetNetWorth)}</span>
                </div>
              </div>
            </div>
            <div className="range-extremes">
              <span>Worst: {formatCurrency(results.worstCases[0]?.finalBalance || 0)}</span>
              <span>Best: {formatCurrency(results.bestCases[0]?.finalBalance || 0)}</span>
            </div>
          </div>
          <p className="hint">Shows your median path vs. the "Finish Line" across all historical simulations.</p>
        </section>

        <section className="stress-gap-card card highlight">
          <h3>The Stress Gap</h3>
          {stressGap > 0 ? (
            <>
              <p>To reach <strong>100% historical resilience</strong> (surviving 1929), choose one:</p>
              <div className="gap-options">
                <div className="gap-option">
                  <div className="gap-value">+{formatCurrency(stressGap)}/mo</div>
                  <p className="hint">Extra investment needed.</p>
                </div>
                <div className="gap-divider">OR</div>
                <div className="gap-option">
                  <div className="gap-value">+{Math.ceil(stressDelay / 12 * 10) / 10} yrs</div>
                  <p className="hint">Delay your target date.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p>Your current plan has <strong>100% historical resilience</strong>.</p>
              <div className="gap-value success">Bulletproof</div>
              <p className="hint">Your "Monthly Fuel" is sufficient to survive all historical market crashes since 1926.</p>
            </>
          )}
        </section>

        <section className="era-comparison card full-width">
          <div className="era-split">
            <div className="era-column">
              <h4>Unluckiest Start Dates</h4>
              <div className="failure-list">
                {results.worstCases.length > 0 ? (
                  results.worstCases.map(wc => {
                    const event = getHistoricalEvent(wc.startDate);
                    return (
                      <div key={wc.startDate} className="failure-item">
                        <div className="era-info">
                          <span className="era">{wc.startDate}</span>
                          {event && <span className="event-name"> ({event})</span>}
                        </div>
                        <span className="reason">
                          {wc.failureReason === 'safety' ? 'Safety Margin' : 'Goal Missed'} 
                          (Year {Math.floor((wc.failureMonth || 0) / 12)})
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p>No failures found. Your plan is bulletproof!</p>
                )}
              </div>
            </div>
            <div className="era-column">
              <h4>Luckiest Start Dates</h4>
              <div className="success-list">
                {results.bestCases.map(bc => {
                  const outperformance = (bc.finalBalance / targetNetWorth - 1) * 100;
                  return (
                    <div key={bc.startDate} className="success-item">
                      <span className="era">{bc.startDate}</span>
                      <span className="outcome">+{outperformance.toFixed(0)}% Over Goal</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MonteCarloView;
