# Monte Carlo Stress Test Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement a "Historical Replay" Monte Carlo engine that tests financial plans against 100 years of real market data.

**Architecture:** A standalone logic engine performs rolling-window simulations using an embedded JSON dataset of S&P 500 returns and CPI inflation. The results are displayed in a reactive React view with resilience scoring and failure analysis.

**Tech Stack:** React, TypeScript, Dexie.js, `date-fns`, Vanilla CSS.

---

### Task 1: Historical Data Integration

**Files:**
- Create: `src/data/historical-returns.json`
- Create: `src/types/monteCarlo.ts`

- [x] **Step 1: Define Monte Carlo data types**

```typescript
// src/types/monteCarlo.ts
export interface HistoricalDataPoint {
  date: string; // YYYY-MM
  sp500: number; // Monthly total return (multiplier, e.g., 1.01 for 1%)
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
  stressGap: number;
}
```

- [x] **Step 2: Create the historical returns dataset (Truncated for plan, use full data in implementation)**

```json
// src/data/historical-returns.json
[
  { "date": "1926-01", "sp500": 1.0069, "cpi": 17.9 },
  { "date": "1926-02", "sp500": -0.0318, "cpi": 17.8 }
  // ... (Full data will be provided during implementation)
]
```

- [x] **Step 3: Commit data structures**

```bash
git add src/types/monteCarlo.ts src/data/historical-returns.json
git commit -m "feat: add Monte Carlo data types and historical dataset"
```

### Task 2: Monte Carlo Engine Logic

**Files:**
- Create: `src/logic/monteCarloEngine.ts`
- Test: `src/logic/monteCarloEngine.test.ts` (or verify via script)

- [x] **Step 1: Implement the simulation core**

```typescript
// src/logic/monteCarloEngine.ts
import historicalData from '../data/historical-returns.json';
import { FinancialSettings } from '../types/financial';
import { MonteCarloResults, SimulationResult } from '../types/monteCarlo';

export const runMonteCarlo = (settings: FinancialSettings): MonteCarloResults => {
  const { initialAssets, targetMonthlyIncome, withdrawalRate, targetDate } = settings;
  const horizonMonths = Math.max(1, /* calculation from current date to targetDate */);
  const targetNetWorth = (targetMonthlyIncome * 12) / (withdrawalRate / 100);

  const results: SimulationResult[] = [];

  // Loop through every possible starting point in history
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
      const monthlyContribution = 0; // TODO: Logic to back-calculate current fuel if needed
      // Actually, we should use the 'monthlyFuel' from the linear engine results as the base
      
      balance = balance * (1 + data.sp500) + (settings.monthlyFuel || 0) * inflationFactor;
      totalContributed += (settings.monthlyFuel || 0) * inflationFactor;

      // Safety Margin: Principal Protection
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
    resilienceScore: (successCount / results.length) * 100,
    totalSimulations: results.length,
    successCount,
    worstCases: results.filter(r => !r.success).sort((a, b) => a.finalBalance - b.finalBalance).slice(0, 5),
    stressGap: 0 // Placeholder for Task 3
  };
};
```

- [x] **Step 2: Commit engine logic**

```bash
git add src/logic/monteCarloEngine.ts
git commit -m "feat: implement Monte Carlo historical replay engine"
```

### Task 3: Stress Gap Calculation

**Files:**
- Modify: `src/logic/monteCarloEngine.ts`

- [x] **Step 1: Implement iterative search for 100% success fuel**

```typescript
// Add to src/logic/monteCarloEngine.ts
export const calculateStressGap = (settings: FinancialSettings): number => {
  let low = 0;
  let high = settings.targetMonthlyIncome * 5; // Reasonable upper bound
  let bestFuel = high;

  // Binary search for the minimal fuel that survives 100% of history
  for (let i = 0; i < 15; i++) {
    const mid = (low + high) / 2;
    const testSettings = { ...settings, monthlyFuel: mid };
    const results = runMonteCarlo(testSettings);
    
    if (results.resilienceScore === 100) {
      bestFuel = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.max(0, bestFuel - (settings.monthlyFuel || 0));
};
```

- [x] **Step 2: Commit stress gap logic**

```bash
git commit -am "feat: add Stress Gap calculation to Monte Carlo engine"
```

### Task 4: UI Implementation (MonteCarloView)

**Files:**
- Create: `src/components/MonteCarlo/MonteCarloView.tsx`
- Create: `src/components/MonteCarlo/MonteCarloView.css`
- Modify: `src/App.tsx`

- [x] **Step 1: Build the Resilience Dashboard UI**

```tsx
// src/components/MonteCarlo/MonteCarloView.tsx
import React, { useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { runMonteCarlo, calculateStressGap } from '../../logic/monteCarloEngine';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import './MonteCarloView.css';

const MonteCarloView: React.FC = () => {
  const { settings } = useSettings();
  
  const results = useMemo(() => {
    if (!settings) return null;
    return runMonteCarlo(settings);
  }, [settings]);

  const stressGap = useMemo(() => {
    if (!settings) return 0;
    return calculateStressGap(settings);
  }, [settings]);

  if (!results) return <div>Loading simulations...</div>;

  return (
    <div className="monte-carlo-container">
      <header className="mc-header">
        <h1>Historical Resilience</h1>
        <p>Testing your plan against every market cycle since 1926.</p>
      </header>

      <div className="mc-grid">
        <section className="score-card card">
          <div className="gauge-container">
            <div className="gauge-value">{results.resilienceScore.toFixed(1)}%</div>
            <div className="gauge-label">Resilience Score</div>
          </div>
          <p>Your plan survived {results.successCount} out of {results.totalSimulations} historical starts.</p>
        </section>

        <section className="stress-gap-card card highlight">
          <h3>The Stress Gap</h3>
          <p>To reach <strong>100% historical resilience</strong> (surviving 1929), you need:</p>
          <div className="gap-value">+{formatCurrency(stressGap)}/mo</div>
          <p className="hint">Extra investment required to disaster-proof your path.</p>
        </section>

        <section className="worst-cases-card card">
          <h3>Unluckiest Start Dates</h3>
          <div className="failure-list">
            {results.worstCases.map(wc => (
              <div key={wc.startDate} className="failure-item">
                <span className="era">{wc.startDate}</span>
                <span className="reason">Failed (Year {Math.floor((wc.failureMonth || 0) / 12)})</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
```

- [x] **Step 2: Update App navigation**

```tsx
// src/App.tsx
// Add MonteCarloView to tabs and renderContent
```

- [x] **Step 3: Commit UI**

```bash
git add src/components/MonteCarlo/ src/App.tsx
git commit -m "feat: implement Monte Carlo Resilience Dashboard UI"
```
