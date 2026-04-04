import historicalData from '../data/historical-returns.json';
import { FinancialSettings } from '../types/financial';
import { MonteCarloResults, SimulationResult } from '../types/monteCarlo';
import { calculateRequiredFuel } from './engine';
import { differenceInMonths, parseISO } from 'date-fns';

/**
 * Runs a single simulation window through history.
 */
const simulateWindow = (
  startIndex: number,
  horizonMonths: number,
  initialAssets: number,
  monthlyFuel: number,
  targetNetWorth: number
): SimulationResult => {
  let balance = initialAssets;
  let totalContributed = initialAssets;
  let failed = false;
  let failureMonth = -1;
  let failureReason: 'goal' | 'safety' | undefined;

  const startCPI = historicalData[startIndex].cpi;

  for (let m = 0; m < horizonMonths; m++) {
    const data = historicalData[startIndex + m];
    const currentCPI = data.cpi;
    const inflationFactor = currentCPI / startCPI;

    // Adjust contribution for inflation
    balance = balance * (1 + data.sp500) + monthlyFuel * inflationFactor;
    totalContributed += monthlyFuel * inflationFactor;

    // Safety Margin: Principal Protection
    if (balance < totalContributed) {
      failed = true;
      failureMonth = m;
      failureReason = 'safety';
      break;
    }
  }

  if (!failed) {
    const endCPI = historicalData[startIndex + horizonMonths].cpi;
    const finalInflationFactor = endCPI / startCPI;
    const adjustedGoal = targetNetWorth * finalInflationFactor;

    if (balance < adjustedGoal) {
      failed = true;
      failureReason = 'goal';
    }
  }

  return {
    startDate: historicalData[startIndex].date,
    endDate: historicalData[startIndex + horizonMonths].date,
    success: !failed,
    finalBalance: balance,
    failureMonth: failureMonth >= 0 ? failureMonth : undefined,
    failureReason
  };
};

export const runMonteCarlo = (
  settings: FinancialSettings, 
  overrideFuel?: number,
  overrideHorizonMonths?: number
): MonteCarloResults => {
  const { initialAssets, targetMonthlyIncome, withdrawalRate, targetDate } = settings;
  
  // Use override fuel if provided, otherwise calculate it using the linear engine
  const monthlyFuel = overrideFuel !== undefined 
    ? overrideFuel 
    : calculateRequiredFuel(settings).monthlyFuel;
  
  const now = new Date();
  const target = parseISO(targetDate);
  const horizonMonths = overrideHorizonMonths !== undefined 
    ? overrideHorizonMonths 
    : Math.max(1, differenceInMonths(target, now));
    
  const targetNetWorth = (targetMonthlyIncome * 12) / (withdrawalRate / 100);

  const results: SimulationResult[] = [];

  // Loop through every possible starting point in history
  for (let i = 0; i < historicalData.length - horizonMonths; i++) {
    results.push(simulateWindow(i, horizonMonths, initialAssets, monthlyFuel, targetNetWorth));
  }

  const successCount = results.filter(r => r.success).length;
  const sortedBalances = [...results].map(r => r.finalBalance).sort((a, b) => a - b);
  const medianBalance = sortedBalances.length > 0 
    ? sortedBalances[Math.floor(sortedBalances.length / 2)] 
    : 0;
  
  return {
    resilienceScore: results.length > 0 ? (successCount / results.length) * 100 : 0,
    totalSimulations: results.length,
    successCount,
    worstCases: results.filter(r => !r.success).sort((a, b) => a.finalBalance - b.finalBalance).slice(0, 5),
    bestCases: results.filter(r => r.success).sort((a, b) => b.finalBalance - a.finalBalance).slice(0, 5),
    medianBalance,
    stressGap: 0
  };
};

export interface ScenarioPoint {
  month: number;
  balance: number;
  date: string;
}

/**
 * Replays a specific historical era for a deep-dive visualization.
 */
export const runHistoricalScenario = (
  settings: FinancialSettings,
  startYear: string
): ScenarioPoint[] => {
  const { initialAssets, targetDate } = settings;
  const now = new Date();
  const target = parseISO(targetDate);
  const horizonMonths = Math.max(1, differenceInMonths(target, now));
  const { monthlyFuel } = calculateRequiredFuel(settings);

  const startIndex = historicalData.findIndex(d => d.date.startsWith(startYear));
  if (startIndex === -1) return [];

  const points: ScenarioPoint[] = [];
  let balance = initialAssets;
  const startCPI = historicalData[startIndex].cpi;

  for (let m = 0; m < horizonMonths && (startIndex + m) < historicalData.length; m++) {
    const data = historicalData[startIndex + m];
    const inflationFactor = data.cpi / startCPI;
    balance = balance * (1 + data.sp500) + monthlyFuel * inflationFactor;
    
    points.push({
      month: m,
      balance,
      date: data.date
    });

    if (balance <= 0) break;
  }

  return points;
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
    const results = runMonteCarlo(settings, mid);
    
    if (results.resilienceScore === 100) {
      bestFuel = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.max(0, bestFuel - monthlyFuel);
};

/**
 * Calculates the number of additional months needed to reach 100% resilience with current fuel
 */
export const calculateStressDelay = (settings: FinancialSettings): number => {
  const now = new Date();
  const target = parseISO(settings.targetDate);
  const baseHorizon = Math.max(1, differenceInMonths(target, now));
  const { monthlyFuel } = calculateRequiredFuel(settings);

  // If already 100% resilient, no delay
  if (runMonteCarlo(settings).resilienceScore === 100) {
    return 0;
  }

  let low = baseHorizon;
  let high = baseHorizon + (20 * 12); // Up to 20 years delay search
  let bestHorizon = high;

  for (let i = 0; i < 15; i++) {
    const mid = Math.floor((low + high) / 2);
    const results = runMonteCarlo(settings, monthlyFuel, mid);
    
    if (results.resilienceScore === 100) {
      bestHorizon = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.max(0, bestHorizon - baseHorizon);
};
