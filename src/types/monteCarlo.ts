// src/types/monteCarlo.ts
export interface HistoricalDataPoint {
  date: string; // YYYY-MM
  sp500: number; // Monthly decimal return 'r' (e.g., 0.01 for 1%, -0.05 for -5%)
  cpi: number; // Monthly CPI value
}

export interface SimulationResult {
  startDate: string;
  endDate: string;
  success: boolean;
  finalBalance: number;
  failureMonth?: number;
  failureReason?: 'goal' | 'safety';
}

export interface MonteCarloResults {
  resilienceScore: number;
  totalSimulations: number;
  successCount: number;
  worstCases: SimulationResult[];
  bestCases: SimulationResult[];
  medianBalance: number;
  stressGap: number;
  stressDelay?: number; // in months
}
