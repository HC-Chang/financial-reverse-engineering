# Design Doc: Live Calibration Engine (V1)

## Overview
The Live Calibration Engine transforms the "Financial Freedom Engine" from a static projection tool into a dynamic feedback loop. It replaces fixed onboarding values with real-time data from the user's accounts and transactions stored in IndexedDB, providing an accurate, up-to-the-minute "Monthly Fuel" requirement.

## Goals
- **Real-Time Accuracy:** Use live account balances instead of static `initialAssets` for all projections.
- **Drift Visualization:** Quantify the gap between the "Plan" (onboarding baseline) and "Reality" (current net worth).
- **Proactive Guidance:** Automatically update the required investment amount as market performance or spending habits shift the user's net worth.

## Architecture

### 1. Data Aggregation (Live Net Worth)
- **Source:** The `accounts` table in IndexedDB (managed via Dexie.js).
- **Implementation:** A `useLiveQuery` hook in the main dashboard or a dedicated `useNetWorth` hook to sum all `account.balance` values.
- **Edge Cases:** Correctly handle accounts with negative balances (debts/loans).

### 2. Logic Engine Enhancements
- **Transient Overrides:** The `calculateRequiredFuel` function will be updated (or wrapped) to accept a `currentNetWorth` override.
- **Calculation Logic:**
    - **Original Plan:** Uses `initialAssets` from `FinancialSettings`.
    - **Live Plan:** Uses the live aggregate net worth as the starting point (`PV`).
    - **Drift calculation:** `Live Fuel - Original Fuel`.
- **Projection Updates:** The wealth projection chart will start from the *current date* and *current net worth*, rather than the onboarding date.

### 3. Dashboard UI Components
- **Dynamic Fuel Card:** Displays the live required monthly investment.
    - *Visual Indicator:* Show a "down arrow" (green) if fuel has decreased due to overperformance, or an "up arrow" (red) if it has increased.
- **Engine Status Badge:** A status indicator (Ahead/On Track/Lagging) based on the percentage drift from the original projection.
    - `Ahead`: > 2% above projection.
    - `On Track`: +/- 2%.
    - `Lagging`: > 2% below projection.
- **Last Updated Stamp:** Show the most recent timestamp from either a manual account update or a CSV import.

## Data Flow
1. **IndexedDB:** User imports CSV or updates an account balance.
2. **useLiveQuery:** Automatically detects the change and recalculates the aggregate Net Worth.
3. **Engine:** The `calculateRequiredFuel` function runs with the new `currentNetWorth`.
4. **State Update:** The Dashboard UI re-renders with the updated "Monthly Fuel" and performance metrics.

## Success Criteria
- **Immediate Feedback:** Changing an account balance or importing a CSV results in an instant update to the "Monthly Fuel" metric.
- **Precision:** The "Drift" calculation accurately reflects how many dollars per month the user's plan has shifted.
- **Robustness:** Handles cases with no accounts or zero balances by falling back to onboarding settings.

## Testing Strategy
- **Unit Tests:** Verify `calculateRequiredFuel` with various `initialAssets` vs. `currentNetWorth` scenarios.
- **Integration Tests:** Ensure `useLiveQuery` correctly triggers re-calculations when the `accounts` table is modified.
- **Visual Audit:** Confirm the "Engine Status" badge correctly reflects "Ahead" vs "Lagging" states.
