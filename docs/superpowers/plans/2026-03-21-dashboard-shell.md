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

### Task 5: PWA Finalization

**Files:**
- Modify: `vite.config.ts` (Refine manifest)
- Create: `public/icons/` (Placeholder icons)

- [ ] **Step 1: Refine PWA manifest in `vite.config.ts` (theme color, icons, short name)**
- [ ] **Step 2: Add placeholder icons to `public/icons/`**
- [ ] **Step 3: Verify "Install App" and offline caching in Chrome DevTools**
- [ ] **Step 4: Final verification of Onboarding -> Dashboard flow**
- [ ] **Step 5: Commit PWA configuration**
