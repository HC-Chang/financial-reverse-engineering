export interface FinancialSettings {
  id?: number; // Singleton ID: 1
  targetMonthlyIncome: number;
  initialAssets: number;
  annualReturn: number;
  withdrawalRate: number;
  targetDate: string; // ISO string
  isSetupComplete: boolean;
}

export interface Account {
  id?: number;
  name: string;
  balance: number;
  type: 'Taxable' | 'Roth' | 'Traditional' | 'Cash';
  lastUpdated: string;
}

export interface ProjectionPoint {
  date: string;
  balance: number;
}

export interface EngineResults {
  monthlyFuel: number;
  netWorthGoal: number;
  daysToFreedom: number;
  projection: ProjectionPoint[];
}
