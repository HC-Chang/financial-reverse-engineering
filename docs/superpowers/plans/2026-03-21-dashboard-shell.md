# Dashboard Shell & Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first PWA with an onboarding wizard that captures core financial parameters and a dashboard shell that displays the initial "Monthly Fuel" required.

**Architecture:** React (Vite/TS) with Dexie.js for IndexedDB persistence. View switching via simple state (`onboarding` vs `dashboard`) and `useLiveQuery` for reactive data binding.

**Tech Stack:** React, TypeScript, Vite, Dexie.js, Vanilla CSS, `vite-plugin-pwa`, `date-fns`.

---

### Task 1: Project Scaffolding & Types

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/types/financial.ts`
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `package.json` with dependencies (`dexie`, `dexie-react-hooks`, `date-fns`) and devDependencies (`vite-plugin-pwa`)**
- [ ] **Step 2: Create `tsconfig.json` for TypeScript configuration**
- [ ] **Step 3: Define core interfaces in `src/types/financial.ts` (Settings, EngineResults)**
- [ ] **Step 4: Create `vite.config.ts` with React and PWA plugin (generateSW mode)**
- [ ] **Step 5: Create `index.html` as the entry point**
- [ ] **Step 6: Create `src/main.tsx` to bootstrap React**
- [ ] **Step 7: Create `src/styles/global.css` with financial color theme and variables**
- [ ] **Step 8: Run `npm install` and verify the dev server starts**
- [ ] **Step 9: Commit initial project structure**

### Task 2: Persistence Layer & Context (Dexie.js)

**Files:**
- Create: `src/db/database.ts`
- Create: `src/context/SettingsContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Define `FinancialDatabase` class in `src/db/database.ts` with a singleton `settings` table**
- [ ] **Step 2: Implement `SettingsProvider` in `src/context/SettingsContext.tsx` using `useLiveQuery`**
- [ ] **Step 3: Update `src/App.tsx` to use `SettingsProvider` and swap between `OnboardingView` and `DashboardView`**
- [ ] **Step 4: Verify Dexie initialization and context propagation**
- [ ] **Step 5: Commit persistence layer**

### Task 3: Onboarding View

**Files:**
- Create: `src/components/Onboarding/OnboardingView.tsx`
- Create: `src/components/Onboarding/OnboardingView.css`
- Create: `src/utils/formatters.ts`

- [ ] **Step 1: Implement `Intl.NumberFormat` helpers in `src/utils/formatters.ts`**
- [ ] **Step 2: Build the single-page form UI in `OnboardingView.tsx` with validation (no 0% withdrawal rate)**
- [ ] **Step 3: Implement `handleCalculate` to save the singleton record (ID: 1) to Dexie**
- [ ] **Step 4: Verify form correctly updates IndexedDB and triggers view switch**
- [ ] **Step 5: Commit Onboarding view**

### Task 4: Dashboard Shell & Logic Engine

**Files:**
- Create: `src/logic/engine.ts`
- Create: `src/components/Dashboard/DashboardView.tsx`
- Create: `src/components/Dashboard/DashboardView.css`

- [ ] **Step 1: Implement the "Monthly Fuel" PMT formula in `src/logic/engine.ts`**
- [ ] **Step 2: Create `DashboardView.tsx` and fetch settings from `SettingsContext`**
- [ ] **Step 3: Build stat cards for "Monthly Fuel," "Net Worth Goal," and "Days to Freedom" (using `date-fns`)**
- [ ] **Step 4: Implement persistent navigation sidebar (layout shell)**
- [ ] **Step 5: Verify dashboard updates in real-time when settings change**
- [ ] **Step 6: Commit Dashboard shell**

### Task 5: Projection Engine & PWA Finalization

**Files:**
- Modify: `src/logic/engine.ts`
- Modify: `src/components/Dashboard/DashboardView.tsx`
- Modify: `vite.config.ts` (Refine manifest)
- Create: `public/icons/` (Placeholder icons)

- [x] **Step 1: Refine PWA manifest in `vite.config.ts` (theme color, icons, short name)**
- [x] **Step 2: Add placeholder icons to `public/icons/`**
- [x] **Step 3: Implement `calculateProjection` in `src/logic/engine.ts` to return monthly data points**
- [x] **Step 4: Update `DashboardView.tsx` to display a simple projection chart or table**
- [ ] **Step 5: Verify "Install App" and offline caching in Chrome DevTools**
- [ ] **Step 6: Final verification of Onboarding -> Dashboard flow**
- [x] **Step 7: Commit Projection & PWA configuration**

### Task 6: Account Management (Dexie.js)

**Files:**
- Modify: `src/db/database.ts` (Add `accounts` table)
- Create: `src/components/Accounts/AccountsView.tsx`
- Create: `src/components/Accounts/AccountsView.css`
- Modify: `src/App.tsx` (Add routing/view switching for Accounts)

- [x] **Step 1: Update `FinancialDatabase` schema to include `accounts` table**
- [x] **Step 2: Implement `AccountsView` to list, add, and delete financial accounts**
- [x] **Step 3: Update `App.tsx` to handle navigation between Overview and Accounts**
- [x] **Step 4: Verify accounts are correctly saved to IndexedDB**
- [x] **Step 5: Commit Account management feature**

### Task 7: Universal CSV Mapper (Transactions)

**Files:**
- Modify: `src/db/database.ts` (Add `transactions` table)
- Create: `src/components/CSVImport/CSVImportView.tsx`
- Create: `src/components/CSVImport/CSVImportView.css`
- Create: `src/logic/csvMapper.ts`
- Modify: `src/App.tsx` (Add CSV Import navigation)

- [x] **Step 1: Add `transactions` table to `FinancialDatabase` (id, date, amount, description, category, accountId)**
- [x] **Step 2: Implement `parseCSV` utility in `src/logic/csvMapper.ts` with basic auto-detection for common headers**
- [x] **Step 3: Build `CSVImportView` with file dropzone and mapping interface (select which column is Date, Amount, etc.)**
- [x] **Step 4: Implement transaction saving logic with duplicate detection (hash-based)**
- [x] **Step 5: Update `App.tsx` to handle the "CSV Import" tab**
- [x] **Step 6: Verify transactions are correctly imported and associated with accounts**
- [x] **Step 7: Commit CSV Mapper feature**

### Task 8: Automated Reconciliation (Engine Update)

**Files:**
- Modify: `src/logic/engine.ts` (Add `reconcileAccount` logic)
- Modify: `src/components/Accounts/AccountsView.tsx` (Add reconciliation UI)

- [x] **Step 1: Implement `calculateBalance` in `src/logic/engine.ts` that sums transactions for a given account**
- [x] **Step 2: Update `AccountsView` to show a "Reconcile" button if manual balance != calculated balance**
- [x] **Step 3: Implement "Sync Balance" action that updates account manual balance to match transaction sum**
- [x] **Step 4: Verify engine correctly sums positive/negative transactions**
- [x] **Step 5: Commit Reconciliation logic**

### Task 9: Asset Rebalancing Visualization

**Files:**
- Modify: `src/types/financial.ts` (Add `AssetAllocation` types)
- Modify: `src/logic/engine.ts` (Add `calculateAllocation` logic)
- Create: `src/components/Rebalance/RebalanceView.tsx`
- Create: `src/components/Rebalance/RebalanceView.css`
- Modify: `src/App.tsx` (Add Rebalance navigation)

- [x] **Step 1: Define `AssetAllocation` interface (Account totals grouped by type)**
- [x] **Step 2: Implement `calculateAllocation` in `src/logic/engine.ts`**
- [x] **Step 3: Create `RebalanceView` with a donut-style visualization (using CSS gradients or simple bars)**
- [x] **Step 4: Implement "Target Allocation" settings (manual input for now)**
- [x] **Step 5: Display "Drift" (Actual vs. Target) and suggest buy/sell actions**
- [x] **Step 6: Update `App.tsx` with a "Rebalance" tab**
- [x] **Step 7: Commit Rebalancing feature**

### Task 10: Subscription Audit Tool

**Files:**
- Modify: `src/logic/engine.ts` (Add `detectSubscriptions` logic)
- Create: `src/components/Subscriptions/SubscriptionView.tsx`
- Create: `src/components/Subscriptions/SubscriptionView.css`
- Modify: `src/App.tsx` (Add Subscriptions navigation)

- [x] **Step 1: Implement `detectSubscriptions` in `src/logic/engine.ts` (Identify recurring description/amount pairs)**
- [x] **Step 2: Create `SubscriptionView` to list detected recurring expenses**
- [x] **Step 3: Add "Ignore" or "Confirm" status to detected subscriptions**
- [x] **Step 4: Calculate "Annual Leak" (Monthly cost * 12) for each subscription**
- [x] **Step 5: Update `App.tsx` with a "Subscriptions" tab**
- [x] **Step 6: Commit Subscription Audit feature**

### Task 11: Tax Strategy Engine (Optimization)

**Files:**
- Modify: `src/logic/engine.ts` (Add `calculateTaxEfficiency` logic)
- Create: `src/components/Tax/TaxView.tsx`
- Create: `src/components/Tax/TaxView.css`
- Modify: `src/App.tsx` (Add Tax navigation)

- [x] **Step 1: Implement basic retirement tax estimator in `src/logic/engine.ts`**
- [x] **Step 2: Define prioritized contribution order (e.g., Roth vs Traditional vs Taxable)**
- [x] **Step 3: Create `TaxView` with a "Contribution Waterfall" visualization**
- [x] **Step 4: Display "Effective Rate" projections for current vs. target retirement**
- [x] **Step 5: Update `App.tsx` with a "Tax Strategy" tab**
- [x] **Step 6: Commit Tax Strategy feature**
