import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/database';
import { useSettings } from '../../context/SettingsContext';
import { runMonteCarlo, calculateStressGap, calculateStressDelay, runHistoricalScenario } from '../../logic/monteCarloEngine';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import AreaChart from '../Common/AreaChart';
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
  const { t } = useTranslation();
  const { settings } = useSettings();
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);

  const totalBalance = useMemo(() => {
    return (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);
  
  const results = useMemo(() => {
    if (!settings) return null;
    return runMonteCarlo(settings, undefined, undefined, totalBalance);
  }, [settings, totalBalance]);

  const stressGap = useMemo(() => {
    if (!settings) return 0;
    return calculateStressGap(settings, totalBalance);
  }, [settings, totalBalance]);

  const stressDelay = useMemo(() => {
    if (!settings) return 0;
    return calculateStressDelay(settings, totalBalance);
  }, [settings, totalBalance]);

  const targetNetWorth = useMemo(() => {
    if (!settings) return 0;
    return (settings.targetMonthlyIncome * 12) / (settings.withdrawalRate / 100);
  }, [settings]);

  const scenarioData = useMemo(() => {
    if (!selectedEra || !settings) return null;
    const eraKey = selectedEra.split('-')[0];
    const points = runHistoricalScenario(settings, eraKey, totalBalance);
    return points.map(p => ({ x: p.month, y: p.balance, label: p.date }));
  }, [selectedEra, settings, totalBalance]);

  if (!results) return <div className="monte-carlo-container">{t('common.loading')}</div>;

  const getHistoricalEvent = (dateStr: string) => {
    const year = dateStr.split('-')[0];
    return HISTORICAL_CONTEXT[year];
  };

  return (
    <div className="monte-carlo-container">
      <header className="mc-header">
        <h1>{t('monteCarlo.title')}</h1>
        <p>{t('monteCarlo.subtitle')}</p>
      </header>

      <div className="mc-grid">
        <section className="score-card card">
          <div className="gauge-container">
            <div className="gauge-value">{results.resilienceScore.toFixed(1)}%</div>
            <div className="gauge-label">{t('monteCarlo.scoreLabel')}</div>
          </div>
          <p>{t('monteCarlo.survived', { count: results.successCount, total: results.totalSimulations })}</p>
        </section>

        <section className="resilience-range-card card">
          <h3>{t('monteCarlo.distribution')}</h3>
          <p>{t('monteCarlo.finalBalances')}</p>
          <div className="range-visual">
            <div className="range-bar-container">
              <div className="range-bar">
                <div className="marker median" style={{ left: `${Math.min(100, (results.medianBalance / results.bestCases[0].finalBalance) * 100)}%` }}>
                  <span className="marker-label">{t('monteCarlo.median')}: {formatCurrency(results.medianBalance)}</span>
                </div>
                <div className="marker goal" style={{ left: `${Math.min(100, (targetNetWorth / results.bestCases[0].finalBalance) * 100)}%` }}>
                  <span className="marker-label">{t('dashboard.goal')}: {formatCurrency(targetNetWorth)}</span>
                </div>
              </div>
            </div>
            <div className="range-extremes">
              <span>{t('monteCarlo.worst')}: {formatCurrency(results.worstCases[0]?.finalBalance || 0)}</span>
              <span>{t('monteCarlo.best')}: {formatCurrency(results.bestCases[0]?.finalBalance || 0)}</span>
            </div>
          </div>
          <p className="hint">Shows your median path vs. the "Finish Line" across all historical simulations.</p>
        </section>

        {selectedEra && scenarioData && (
          <section className="deep-dive-card card full-width highlight">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Scenario Deep Dive: {selectedEra} Replay</h3>
              <button onClick={() => setSelectedEra(null)} className="close-btn">Close &times;</button>
            </div>
            <div style={{ height: '300px', marginTop: '1.5rem' }}>
              <AreaChart 
                data={scenarioData} 
                height={300} 
                color={(scenarioData[scenarioData.length-1]?.y || 0) <= 0 ? '#e74c3c' : '#1abc9c'} 
              />
            </div>
            <p className="hint">Replaying your portfolio path if the {selectedEra} cycle started today.</p>
          </section>
        )}

        <section className="stress-gap-card card highlight">
          <h3>{t('monteCarlo.stressGap')}</h3>
          {stressGap > 0 ? (
            <>
              <p dangerouslySetInnerHTML={{ __html: t('monteCarlo.survive1929') }}></p>
              <div className="gap-options">
                <div className="gap-option">
                  <div className="gap-value">+{formatCurrency(stressGap)}/mo</div>
                  <p className="hint">{t('monteCarlo.extraInvestment')}</p>
                </div>
                <div className="gap-divider">OR</div>
                <div className="gap-option">
                  <div className="gap-value">+{Math.ceil(stressDelay / 12 * 10) / 10} yrs</div>
                  <p className="hint">{t('monteCarlo.delayDate')}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <p>Your current plan has <strong>100% historical resilience</strong>.</p>
              <div className="gap-value success">{t('monteCarlo.bulletproof')}</div>
              <p className="hint">Your "Monthly Fuel" is sufficient to survive all historical market crashes since 1926.</p>
            </>
          )}
        </section>

        <section className="era-comparison card full-width">
          <div className="era-split">
            <div className="era-column">
              <h4>{t('monteCarlo.worstStarts')}</h4>
              <div className="failure-list">
                {results.worstCases.length > 0 ? (
                  results.worstCases.map(wc => {
                    const event = getHistoricalEvent(wc.startDate);
                    return (
                      <div 
                        key={wc.startDate} 
                        className="failure-item clickable"
                        onClick={() => setSelectedEra(wc.startDate)}
                      >
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
              <h4>{t('monteCarlo.bestStarts')}</h4>
              <div className="success-list">
                {results.bestCases.map(bc => {
                  const outperformance = (bc.finalBalance / targetNetWorth - 1) * 100;
                  return (
                    <div 
                      key={bc.startDate} 
                      className="success-item clickable"
                      onClick={() => setSelectedEra(bc.startDate)}
                    >
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
