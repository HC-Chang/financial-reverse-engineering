import { differenceInMonths, differenceInDays, parseISO, addMonths, formatISO } from 'date-fns';
import { FinancialSettings, EngineResults, ProjectionPoint, Transaction, Account, AssetAllocation } from '../types/financial';

/**
 * Detects potential subscriptions by finding recurring transactions with the same description and amount.
 * 
 * @param transactions Array of transactions.
 * @returns Array of detected subscriptions.
 */
export const detectSubscriptions = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  
  // Group by description and amount (rounded)
  transactions.forEach(t => {
    if (t.amount >= 0) return; // Only expenses
    const key = `${t.description.toLowerCase()}-${Math.abs(Math.round(t.amount))}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  return Object.entries(groups)
    .filter(([_, ts]) => ts.length >= 2) // Need at least 2 occurrences
    .map(([_, ts]) => {
      const avgAmount = ts.reduce((sum, t) => sum + t.amount, 0) / ts.length;
      return {
        description: ts[0].description,
        monthlyAmount: Math.abs(avgAmount),
        count: ts.length,
        lastDate: ts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      };
    });
};

/**
 * Provides a prioritized contribution strategy and retirement tax estimates.
 * 
 * @param settings Financial settings.
 * @returns Object with contribution priority and estimated tax rates.
 */
export const calculateTaxStrategy = (settings: FinancialSettings) => {
  const { targetMonthlyIncome } = settings;
  const annualIncome = targetMonthlyIncome * 12;

  // Simple US-based tax estimation for retirement (Standard Deduction + 10% / 12% brackets)
  const standardDeduction = 14600; // 2024 single
  const taxableIncome = Math.max(0, annualIncome - standardDeduction);
  
  let estimatedTax = 0;
  if (taxableIncome > 0) {
    const bracket1 = Math.min(taxableIncome, 11600);
    estimatedTax += bracket1 * 0.10;
    
    if (taxableIncome > 11600) {
      const bracket2 = Math.min(taxableIncome - 11600, 47150 - 11600);
      estimatedTax += bracket2 * 0.12;
    }
  }

  const effectiveRate = annualIncome > 0 ? (estimatedTax / annualIncome) * 100 : 0;

  return {
    effectiveRate,
    estimatedAnnualTax: estimatedTax,
    contributionWaterfall: [
      { priority: 1, name: 'Employer Match', description: 'Immediate 100% ROI. Never leave this on the table.', icon: '🤝' },
      { priority: 2, name: 'Roth IRA / HSA', description: 'Tax-free growth. Best for long-term compounding.', icon: '🛡️' },
      { priority: 3, name: 'Traditional 401k/IRA', description: 'Lower current taxable income. Good if current tax > retirement tax.', icon: '📉' },
      { priority: 4, name: 'Taxable Brokerage', description: 'Maximum flexibility. Subject to capital gains tax.', icon: '📈' }
    ]
  };
};

/**
 * Groups accounts by type and calculates the allocation percentages.
 * 
 * @param accounts Array of financial accounts.
 * @returns Array of asset allocations.
 */
export const calculateAllocation = (accounts: Account[]): AssetAllocation[] => {
  const totalsByType: Record<string, number> = {};
  let grandTotal = 0;

  accounts.forEach(acc => {
    totalsByType[acc.type] = (totalsByType[acc.type] || 0) + acc.balance;
    grandTotal += acc.balance;
  });

  if (grandTotal === 0) return [];

  const types: Account['type'][] = ['Cash', 'Taxable', 'Roth', 'Traditional'];
  
  return types.map(type => ({
    type,
    total: totalsByType[type] || 0,
    percentage: ((totalsByType[type] || 0) / grandTotal) * 100
  }));
};

/**
 * Calculates the sum of all transactions for a given account.
 * 
 * @param transactions Array of transactions for the account.
 * @param initialBalance The starting balance of the account (optional).
 * @returns The final calculated balance.
 */
export const calculateAccountBalance = (transactions: Transaction[], initialBalance: number = 0): number => {
  return transactions.reduce((sum, t) => sum + t.amount, initialBalance);
};

/**
 * Calculates the required monthly investment (fuel) to reach a financial goal.
 * 
 * Formula:
 * PMT = (FV * r) / ((1 + r)^n - 1) - (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
 * 
 * @param settings Financial settings provided by the user.
 * @returns Engine results including monthly fuel, net worth goal, and days to freedom.
 */
export const calculateRequiredFuel = (settings: FinancialSettings): EngineResults => {
  const {
    targetMonthlyIncome,
    initialAssets,
    annualReturn,
    withdrawalRate,
    targetDate,
  } = settings;

  // 1. Calculate Target Net Worth
  // Withdrawal rate is provided as a percentage (e.g., 4 for 4%)
  const withdrawalRateDecimal = withdrawalRate / 100;
  const targetNetWorth = (targetMonthlyIncome * 12) / withdrawalRateDecimal;

  // 2. Calculate time horizon
  const now = new Date();
  const target = parseISO(targetDate);
  const monthsToTarget = Math.max(0, differenceInMonths(target, now));
  const daysToFreedom = Math.max(0, differenceInDays(target, now));

  // 3. Calculate Monthly Return
  // Annual return is provided as a percentage (e.g., 7 for 7%)
  const monthlyReturn = (annualReturn / 100) / 12;

  let monthlyFuel = 0;

  if (monthsToTarget > 0) {
    if (monthlyReturn === 0) {
      monthlyFuel = (targetNetWorth - initialAssets) / monthsToTarget;
    } else {
      const FV = targetNetWorth;
      const PV = initialAssets;
      const r = monthlyReturn;
      const n = monthsToTarget;

      // PMT = (FV * r) / ((1 + r)^n - 1) - (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
      const compoundFactor = Math.pow(1 + r, n);
      const denominator = compoundFactor - 1;
      
      const term1 = (FV * r) / denominator;
      const term2 = (PV * r * compoundFactor) / denominator;
      
      monthlyFuel = term1 - term2;
    }
  } else {
    // If we've already reached the target date
    monthlyFuel = initialAssets >= targetNetWorth ? 0 : Infinity;
  }

  // 4. Generate Projection
  const projection: ProjectionPoint[] = [];
  let currentBalance = initialAssets;
  const startDate = new Date();

  // Add initial point
  projection.push({
    date: formatISO(startDate),
    balance: currentBalance,
  });

  // Calculate points for each month
  for (let i = 1; i <= monthsToTarget; i++) {
    // Apply growth and contribution
    currentBalance = currentBalance * (1 + monthlyReturn) + monthlyFuel;
    projection.push({
      date: formatISO(addMonths(startDate, i)),
      balance: currentBalance,
    });
  }

  return {
    monthlyFuel: Math.max(0, monthlyFuel),
    netWorthGoal: targetNetWorth,
    daysToFreedom,
    projection,
  };
};
