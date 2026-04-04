# Design Doc: Monte Carlo Stress Test Engine

## Overview
The Monte Carlo Stress Test Engine is a rigorous "Historical Replay" tool designed to test the user's financial plan against every possible starting month since 1926. Instead of using a fixed 7% return, it simulates the user's journey through real-world market crashes, high-inflation decades, and boom cycles.

## Goals
- **Quantify Risk:** Provide a "Historical Resilience Score" (0-100%) based on real data.
- **Identify Threats:** Highlight specific historical "Unlucky Starts" (e.g., Sept 1929, July 1972).
- **Principal Protection:** Implement a "Safety Margin" that ensures the user never drops below their total contributions in real terms.
- **Actionable Advice:** Calculate the "Stress Gap"—the extra investment needed to survive 100% of historical scenarios.

## Architecture

### 1. Data Layer
- **`src/data/historical-returns.json`**: A lightweight (~25KB) dataset containing:
    - `date`: YYYY-MM
    - `sp500`: Monthly S&P 500 Total Return (Price + Dividends)
    - `cpi`: Monthly Consumer Price Index (to calculate real inflation)

### 2. Logic Engine (`src/logic/monteCarloEngine.ts`)
The engine will perform a "Brute Force" rolling-window simulation:
- **Rolling Windows:** If the user has a 15-year horizon, the engine runs ~1,100 simulations (starting at Jan 1926, Feb 1926, etc.).
- **Inflation Adjustment:** Contributions and goals are adjusted monthly using historical CPI to preserve purchasing power.
- **Success Criteria:** 
    - Final Balance >= Inflation-Adjusted Net Worth Goal.
    - **Safety Margin:** Balance MUST NOT drop below the cumulative nominal principal contributed at any point during the accumulation phase.

### 3. UI Components (`src/components/MonteCarlo/`)
- **`MonteCarloView.tsx`**: A dedicated view or dashboard section featuring:
    - **Resilience Gauge**: Visual percentage of historical successes.
    - **Unlucky List**: The top 3-5 "Failure Eras" with failure year/reason.
    - **Stress Gap Insight**: Actionable card showing the "Extra Fuel" needed for 100% resilience.

## Technical Approach
1. **Data Embedding**: Embed the historical dataset directly into the bundle (Vite handles JSON imports efficiently).
2. **Batch Processing**: Run the ~1,100 simulations in a single pass (approx. < 100ms execution time on modern devices).
3. **Reactive Binding**: Use `useMemo` to recalculate simulations whenever the user's core settings (target date, monthly fuel) change in `SettingsContext`.

## Success Criteria
- **Rigorous Accuracy**: Simulations correctly reflect historical S&P 500 performance and CPI inflation.
- **Local-First Performance**: Recalculations feel instant on mobile devices.
- **Clarity**: User understands their "Risk Score" and the cost of "Disaster-Proofing" their plan.
