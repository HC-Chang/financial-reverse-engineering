# Design Doc: Personal Financial Reverse Engineering System (V1)

## Overview
A modern web-based (PWA) financial engine designed to reverse-engineer the "monthly fuel" (investment) required to reach a specific financial freedom target. Unlike traditional budgeting apps, this system is "engine-first," prioritizing mathematical projections and automated optimization over simple transaction tracking.

## Goals
- **Quantify the Target:** Calculate the "Financial Freedom Number" and the required monthly investment.
- **Automate the Flow:** Streamline data entry via CSV imports and manual updates.
- **Optimize the Cost:** Audit recurring expenses (subscriptions) and tax efficiency.
- **Maintain the Engine:** Provide rebalancing alerts and dynamic feedback loops based on real market performance.

## Architecture

### 1. Core Logic Engine (The "Brain")
A standalone, testable TypeScript module responsible for all financial calculations.
- **Hybrid Projection Modes:**
    - **Linear:** Fixed 7% (or user-defined) annual return, adjusted for user-defined inflation (e.g., 2% default).
    - **Monte Carlo:** 10,000+ simulations based on historical volatility (Standard Deviation) and randomized inflation scenarios.
    - **Scenario-Based:** Side-by-side comparison of different retirement ages, life paths, and tax-withdrawal strategies.
    - **Dynamic Feedback:** Real-time adjustment of required "fuel" based on actual asset growth, inflation reality, and spending trends.
- **Tax Integration:** Basic logic for prioritizing contributions and withdrawals (e.g., 401k vs. IRA vs. Taxable) and estimating effective tax rates in retirement.
- **Interface:** Functional API (e.g., `calculateRequiredFuel(target, duration, rate, volatility, inflation, taxStrategy) -> MonthlyResult`).

### 2. Web Frontend (The "Dashboard")
A React/Next.js Progressive Web App (PWA).
- **Primary Focus:** "Monthly Cash Flow" visualization (Income vs. Fuel vs. Cost).
- **Interactive UI:** Dynamic charts for net worth growth and scenario comparisons.
- **Data Input:** Manual entry forms and a **Universal CSV Mapper** with preset templates for major banks and a "Custom Map" mode for others.
- **Responsive Design:** Optimized for both desktop and mobile (PWA).

### 3. Data Persistence
- **Storage:** Local-first with **IndexedDB (via Dexie.js)** for robust PWA storage. Includes an automated "Local Backup" (JSON export) and optional encrypted cloud sync (e.g., Supabase/Firebase) for multi-device support.
- **Schema:** Tracks accounts, transactions, balances, and user-defined "Freedom" targets.

## Essential Features
- **Subscription Audit Tool:** Automatically flags recurring transactions for review and potential optimization.
- **Asset Rebalancing:** Visualizes target vs. actual allocation (e.g., VTI/VT/BND) and suggests specific buy/sell actions.
- **Tax Efficiency Logic:** Basic suggestions for prioritizing contributions between Taxable, Roth, and Traditional accounts.
- **Mobile Companion:** PWA features (Offline support, Home screen icon) for quick entry on the go.

## Success Criteria
- **Accuracy:** Engine results must match verified financial models (verified by unit tests).
- **Utility:** User can see exactly how much "fuel" is needed to retire by a specific date.
- **Simplicity:** CSV imports should take less than 60 seconds to process.

## Testing Strategy
- **Unit Tests:** Exhaustive testing of the Logic Engine's mathematical functions.
- **Integration Tests:** End-to-end flows for CSV mapping and data persistence.
- **User Verification:** Visual audits of dashboard charts against raw data.
