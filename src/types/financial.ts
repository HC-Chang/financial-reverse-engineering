export interface FinancialSettings {
  id?: number; // Singleton ID: 1
  targetMonthlyIncome: number;
  initialAssets: number;
  annualReturn: number;
  withdrawalRate: number;
  targetDate: string; // ISO string
  isSetupComplete: boolean;
}

export interface EngineResults {
  monthlyFuel: number;
  netWorthGoal: number;
  daysToFreedom: number;
}
