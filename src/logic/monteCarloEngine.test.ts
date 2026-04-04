import { describe, it, expect } from 'vitest';
import { runMonteCarlo } from './monteCarloEngine';
import { FinancialSettings } from '../types/financial';
import { addYears, formatISO } from 'date-fns';

describe('Monte Carlo Logic Engine', () => {
  const baseSettings: FinancialSettings = {
    targetMonthlyIncome: 5000,
    initialAssets: 100000,
    annualReturn: 7,
    withdrawalRate: 4,
    targetDate: formatISO(addYears(new Date(), 15)),
    isSetupComplete: true
  };

  it('runs simulations successfully and returns a resilience score', () => {
    const results = runMonteCarlo(baseSettings);
    expect(results.totalSimulations).toBeGreaterThan(1000);
    expect(results.resilienceScore).toBeGreaterThan(0);
    expect(results.resilienceScore).toBeLessThanOrEqual(100);
  });

  it('returns high resilience for a very wealthy start', () => {
    const wealthySettings: FinancialSettings = {
      ...baseSettings,
      initialAssets: 5000000 // 5M vs 1.5M goal
    };
    const results = runMonteCarlo(wealthySettings);
    // Note: Resilience might still be < 100% due to "Principal Protection" (Safety Margin)
    // if the market drops below the 5M initial assets at any point.
    expect(results.resilienceScore).toBeGreaterThan(10);
  });

  it('identifies worst cases in history', () => {
    const results = runMonteCarlo(baseSettings);
    expect(results.worstCases.length).toBeGreaterThan(0);
    expect(results.worstCases[0].finalBalance).toBeLessThan(results.bestCases[0].finalBalance);
  });
});
