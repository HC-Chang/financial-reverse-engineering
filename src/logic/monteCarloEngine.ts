import historicalData from '../data/historical-returns.json';
import { FinancialSettings } from '../types/financial';
import { MonteCarloResults, SimulationResult } from '../types/monteCarlo';
import { calculateRequiredFuel } from './engine';
import { differenceInMonths, parseISO } from 'date-fns';

export const runMonteCarlo = (settings: FinancialSettings): MonteCarloResults => {
  const { initialAssets, targetMonthlyIncome, withdrawalRate, targetDate } = settings;
  
  // Calculate monthly fuel using the linear engine
  const { monthlyFuel } = calculateRequiredFuel(settings);
  
  const now = new Date();
  const target = parseISO(targetDate);
  const horizonMonths = Math.max(1, differenceInMonths(target, now));
  const targetNetWorth = (targetMonthlyIncome * 12) / (withdrawalRate / 100);

  const results: SimulationResult[] = [];

  // Loop through every possible starting point in history
  // Data points are monthly, so we can use them as-is.
  for (let i = 0; i < historicalData.length - horizonMonths; i++) {
    let balance = initialAssets;
    let totalContributed = initialAssets;
    let failed = false;
    let failureMonth = -1;
    let failureReason: 'goal' | 'safety' | undefined;

    const startCPI = historicalData[i].cpi;

    for (let m = 0; m < horizonMonths; m++) {
      const data = historicalData[i + m];
      const currentCPI = data.cpi;
      const inflationFactor = currentCPI / startCPI;

      // Adjust contribution for inflation
      balance = balance * (1 + data.sp500) + monthlyFuel * inflationFactor;
      totalContributed += monthlyFuel * inflationFactor;

      // Safety Margin: Principal Protection (balance should not drop below total contributed)
      if (balance < totalContributed) {
        failed = true;
        failureMonth = m;
        failureReason = 'safety';
        break;
      }
    }

    if (!failed) {
      const endCPI = historicalData[i + horizonMonths].cpi;
      const finalInflationFactor = endCPI / startCPI;
      const adjustedGoal = targetNetWorth * finalInflationFactor;

      if (balance < adjustedGoal) {
        failed = true;
        failureReason = 'goal';
      }
    }

    results.push({
      startDate: historicalData[i].date,
      endDate: historicalData[i + horizonMonths].date,
      success: !failed,
      finalBalance: balance,
      failureMonth: failureMonth >= 0 ? failureMonth : undefined,
      failureReason
    });
  }

  const successCount = results.filter(r => r.success).length;
  
  return {
    resilienceScore: results.length > 0 ? (successCount / results.length) * 100 : 0,
    totalSimulations: results.length,
    successCount,
    worstCases: results.filter(r => !r.success).sort((a, b) => a.finalBalance - b.finalBalance).slice(0, 5),
    stressGap: 0 // Placeholder for Task 3
  };
};

/**
 * Binary search for the minimal fuel that survives 100% of history
 */
export const calculateStressGap = (settings: FinancialSettings): number => {
  const { monthlyFuel } = calculateRequiredFuel(settings);
  
  let low = 0;
  let high = settings.targetMonthlyIncome * 5; // Reasonable upper bound
  let bestFuel = high;

  // Binary search for the minimal fuel that survives 100% of history
  for (let i = 0; i < 15; i++) {
    const mid = (low + high) / 2;
    // We need to pass mid as monthlyFuel to runMonteCarlo, but runMonteCarlo calculates it from settings.
    // So we need a version of runMonteCarlo that takes an override fuel.
    const results = runMonteCarloWithFuelOverride(settings, mid);
    
    if (results.resilienceScore === 100) {
      bestFuel = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.max(0, bestFuel - monthlyFuel);
};

// Helper for calculateStressGap to avoid infinite recursion if we used runMonteCarlo which calls calculateRequiredFuel
const runMonteCarloWithFuelOverride = (settings: FinancialSettings, overrideFuel: number): MonteCarloResults => {
  const { initialAssets, targetMonthlyIncome, withdrawalRate, targetDate } = settings;
  
  const now = new Date();
  const target = parseISO(targetDate);
  const horizonMonths = Math.max(1, differenceInMonths(target, now));
  const targetNetWorth = (targetMonthlyIncome * 12) / (withdrawalRate / 100);

  const results: SimulationResult[] = [];

  for (let i = 0; i < historicalData.length - horizonMonths; i++) {
    let balance = initialAssets;
    let totalContributed = initialAssets;
    let failed = false;
    let failureMonth = -1;

    const startCPI = historicalData[i].cpi;

    for (let m = 0; m < horizonMonths; m++) {
      const data = historicalData[i + m];
      const currentCPI = data.cpi;
      const inflationFactor = currentCPI / startCPI;

      balance = balance * (1 + data.sp500) + overrideFuel * inflationFactor;
      totalContributed += overrideFuel * inflationFactor;

      if (balance < totalContributed) {
        failed = true;
        failureMonth = m;
        break;
      }
    }

    if (!failed) {
      const endCPI = historicalData[i + horizonMonths].cpi;
      const finalInflationFactor = endCPI / startCPI;
      const adjustedGoal = targetNetWorth * finalInflationFactor;

      if (balance < adjustedGoal) {
        failed = true;
      }
    }

    results.push({
      startDate: historicalData[i].date,
      endDate: historicalData[i + horizonMonths].date,
      success: !failed,
      finalBalance: balance,
      failureMonth: failureMonth >= 0 ? failureMonth : undefined,
    });
  }

  const successCount = results.filter(r => r.success).length;
  
  return {
    resilienceScore: results.length > 0 ? (successCount / results.length) * 100 : 0,
    totalSimulations: results.length,
    successCount,
    worstCases: [], // Not needed for internal binary search
    stressGap: 0
  };
};
