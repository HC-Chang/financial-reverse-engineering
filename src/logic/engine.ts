import { differenceInMonths, differenceInDays, parseISO, addMonths, formatISO } from 'date-fns';
import { FinancialSettings, EngineResults, ProjectionPoint, Transaction, Account, AssetAllocation, Subscription } from '../types/financial';

/**
 * Detects potential subscriptions by finding recurring transactions with the same description and amount.
 * Now identifies Monthly, Quarterly and Yearly frequencies.
 * 
 * @param transactions Array of transactions.
 * @returns Array of detected subscriptions.
 */
export const detectSubscriptions = (transactions: Transaction[]): Subscription[] => {
  const groups: Record<string, Transaction[]> = {};
  
  // Group by description (fuzzy-ish) and rounded amount
  transactions.forEach(t => {
    if (t.amount >= 0) return; // Only expenses
    // Use a simplified description key to handle slight variations (e.g. "Netflix.com" vs "Netflix")
    const simpleDesc = t.description.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const key = `${simpleDesc}-${Math.abs(Math.round(t.amount))}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const detected: Subscription[] = [];

  Object.values(groups).forEach(ts => {
    if (ts.length < 2) return;

    // Sort by date
    ts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate average gap in days
    const gaps: number[] = [];
    for (let i = 1; i < ts.length; i++) {
      gaps.push(differenceInDays(parseISO(ts[i].date), parseISO(ts[i-1].date)));
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    let frequency: Subscription['frequency'] = 'Monthly';
    let confidence = 0;

    if (avgGap >= 25 && avgGap <= 35) {
      frequency = 'Monthly';
      confidence = 0.9;
    } else if (avgGap >= 85 && avgGap <= 95) {
      frequency = 'Quarterly';
      confidence = 0.8;
    } else if (avgGap >= 360 && avgGap <= 370) {
      frequency = 'Yearly';
      confidence = 0.7;
    } else {
      // Not a clear recurring frequency
      return;
    }

    const avgAmount = Math.abs(ts.reduce((sum, t) => sum + t.amount, 0) / ts.length);
    const monthlyAmount = frequency === 'Monthly' ? avgAmount : 
                          frequency === 'Quarterly' ? avgAmount / 3 : 
                          avgAmount / 12;

    detected.push({
      description: ts[0].description,
      monthlyAmount,
      frequency,
      lastDate: ts[ts.length - 1].date,
      status: 'Detected',
      category: ts[0].category,
      confidence,
      count: ts.length
    });
  });

  return detected;
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
 * Calculates how many months it takes to reach a target net worth with a fixed monthly investment.
 */
export const calculateMonthsToGoal = (
  initialAssets: number,
  monthlyFuel: number,
  targetNetWorth: number,
  annualReturn: number
): number => {
  if (initialAssets >= targetNetWorth) return 0;
  const r = (annualReturn / 100) / 12;
  const p = monthlyFuel;

  if (r === 0) {
    return p > 0 ? (targetNetWorth - initialAssets) / p : Infinity;
  }

  // FV = PV*(1+r)^n + P*(((1+r)^n - 1)/r)
  // Solve for n:
  // FV*r = PV*r*(1+r)^n + P*(1+r)^n - P
  // FV*r + P = (PV*r + P)*(1+r)^n
  // (FV*r + P) / (PV*r + P) = (1+r)^n
  // n = log((FV*r + P) / (PV*r + P)) / log(1+r)

  const n = Math.log((targetNetWorth * r + p) / (initialAssets * r + p)) / Math.log(1 + r);
  return n;
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
