import { describe, it, expect } from 'vitest';
import { calculateRequiredFuel, detectSubscriptions, calculateTaxStrategy } from './engine';
import { FinancialSettings, Transaction } from '../types/financial';
import { formatISO } from 'date-fns';

describe('Financial Logic Engine', () => {
  const baseSettings: FinancialSettings = {
    targetMonthlyIncome: 5000,
    initialAssets: 100000,
    annualReturn: 7,
    withdrawalRate: 4,
    targetDate: '2041-01-01T00:00:00.000Z',
    isSetupComplete: true
  };

  describe('calculateRequiredFuel', () => {
    it('calculates the correct Net Worth Goal based on withdrawal rate', () => {
      const results = calculateRequiredFuel(baseSettings);
      // 5000 * 12 / 0.04 = 1,500,000
      expect(results.netWorthGoal).toBe(1500000);
    });

    it('calculates non-zero monthly fuel for a fixed horizon', () => {
      const results = calculateRequiredFuel(baseSettings);
      expect(results.monthlyFuel).toBeGreaterThan(0);
    });

    it('calculates 0 fuel if already at goal', () => {
      const wealthySettings: FinancialSettings = {
        ...baseSettings,
        initialAssets: 2000000
      };
      const results = calculateRequiredFuel(wealthySettings);
      expect(results.monthlyFuel).toBe(0);
    });

    it('returns Infinity fuel if target date is now and assets < goal', () => {
      const immediateSettings: FinancialSettings = {
        ...baseSettings,
        targetDate: formatISO(new Date())
      };
      const results = calculateRequiredFuel(immediateSettings);
      expect(results.monthlyFuel).toBe(Infinity);
    });
  });

  describe('detectSubscriptions', () => {
    it('identifies recurring transactions as subscriptions', () => {
      const transactions: Transaction[] = [
        { id: 1, accountId: 1, date: '2024-01-01', amount: -15.99, description: 'Netflix', category: 'Entertainment', hash: '1' },
        { id: 2, accountId: 1, date: '2024-02-01', amount: -15.99, description: 'Netflix', category: 'Entertainment', hash: '2' },
        { id: 3, accountId: 1, date: '2024-01-15', amount: -50.00, description: 'Grocery', category: 'Food', hash: '3' },
      ];
      
      const subs = detectSubscriptions(transactions);
      expect(subs).toHaveLength(1);
      expect(subs[0].description).toBe('Netflix');
      expect(subs[0].monthlyAmount).toBe(15.99);
      expect(subs[0].count).toBe(2);
    });

    it('ignores one-off transactions', () => {
      const transactions: Transaction[] = [
        { id: 1, accountId: 1, date: '2024-01-01', amount: -100.00, description: 'Amazon', category: 'Shopping', hash: '1' },
      ];
      const subs = detectSubscriptions(transactions);
      expect(subs).toHaveLength(0);
    });

    it('groups by description (case-insensitive) and rounded amount', () => {
      const transactions: Transaction[] = [
        { id: 1, accountId: 1, date: '2024-01-01', amount: -10.01, description: 'Spotify', category: 'Music', hash: '1' },
        { id: 2, accountId: 1, date: '2024-02-01', amount: -9.99, description: 'spotify', category: 'Music', hash: '2' },
      ];
      const subs = detectSubscriptions(transactions);
      expect(subs).toHaveLength(1);
      expect(subs[0].monthlyAmount).toBe(10);
    });
  });

  describe('calculateTaxStrategy', () => {
    it('calculates 0 tax for income below standard deduction', () => {
      const lowIncomeSettings: FinancialSettings = {
        ...baseSettings,
        targetMonthlyIncome: 1000 // 12000/year < 14600
      };
      const strategy = calculateTaxStrategy(lowIncomeSettings);
      expect(strategy.estimatedAnnualTax).toBe(0);
      expect(strategy.effectiveRate).toBe(0);
    });

    it('calculates tax correctly for income in 10% and 12% brackets', () => {
      // Annual income: 5000 * 12 = 60,000
      // Taxable: 60,000 - 14,600 = 45,400
      // 10% bracket (up to 11,600): 11,600 * 0.10 = 1,160
      // 12% bracket (rest): (45,400 - 11,600) * 0.12 = 33,800 * 0.12 = 4,056
      // Total tax: 1,160 + 4,056 = 5,216
      const strategy = calculateTaxStrategy(baseSettings);
      expect(strategy.estimatedAnnualTax).toBe(5216);
      expect(strategy.effectiveRate).toBeCloseTo((5216 / 60000) * 100, 1);
    });

    it('includes contribution waterfall', () => {
      const strategy = calculateTaxStrategy(baseSettings);
      expect(strategy.contributionWaterfall).toHaveLength(4);
      expect(strategy.contributionWaterfall[0].priority).toBe(1);
    });
  });
});
