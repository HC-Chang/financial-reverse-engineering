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
  openingBalance: number;
  type: 'Taxable' | 'Roth' | 'Traditional' | 'Cash';
  lastUpdated: string;
}

export interface Transaction {
  id?: number;
  accountId: number;
  date: string; // ISO string
  amount: number;
  description: string;
  category: string;
  hash: string; // For duplicate detection
  isSubscription?: boolean;
  subscriptionId?: number;
}

export interface Subscription {
  id?: number;
  description: string;
  monthlyAmount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'Detected' | 'Confirmed' | 'Dismissed';
  lastDate: string;
  category: string;
  confidence: number;
  count: number;
}

export interface AssetAllocation {
  type: Account['type'];
  total: number;
  percentage: number;
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
