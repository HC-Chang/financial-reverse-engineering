import { differenceInMonths, differenceInDays, parseISO } from 'date-fns';
import { FinancialSettings, EngineResults } from '../types/financial';

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

  return {
    monthlyFuel: Math.max(0, monthlyFuel),
    netWorthGoal: targetNetWorth,
    daysToFreedom,
  };
};
