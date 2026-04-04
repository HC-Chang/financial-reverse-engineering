# Design Doc: Financial Reverse Engineering Dashboard Shell & Onboarding

## Overview
The first phase of the Personal Financial Reverse Engineering System focuses on the **Dashboard Shell** and the **Onboarding Wizard**. This provides the technical foundation (React, Dexie.js, PWA) and establishes the initial "engine parameters" required for future mathematical projections.

## Goals
- **Onboarding:** Create a single-page form to capture the "Financial Freedom Number," target date, and initial assets.
- **Dashboard Shell:** Implement a clean, professional React UI with navigation and empty states for future features.
- **Persistence:** Use IndexedDB (via Dexie.js) to store user settings locally, ensuring a "local-first" experience.
- **Responsive PWA:** Configure the project as a Progressive Web App with a fast development loop (Vite).

## Architecture

### 1. Frontend Framework
- **React (Vite + TypeScript):** For a type-safe, high-performance UI.
- **State Management:** 
    - **React Context:** Used for global user settings and view state.
    - **Dexie `useLiveQuery`:** For automatic UI synchronization with IndexedDB.
- **Styling:** **Vanilla CSS** with global variables (`:root`) for consistent financial branding and spacing.
- **Utilities:** `Intl.NumberFormat` for precise currency and percentage handling.

### 2. Data Persistence (Local-First)
- **Dexie.js:** An IndexedDB wrapper for local storage.
- **Schema (v1):**
    - `settings`: (Singleton table)
        - `targetMonthlyIncome` (Number): Goal spending in retirement (today's dollars).
        - `initialAssets` (Number): Current investable assets.
        - `annualReturn` (Number): Expected annual return (default 0.07).
        - `withdrawalRate` (Number): Default 0.04 (4% rule).
        - `targetDate` (Date): Month/year target.
        - `isSetupComplete` (Boolean): View toggle flag.

### 3. Core Components

#### Onboarding Wizard (`OnboardingView.tsx`)
- **Single-Page Form:**
    - "Your Monthly Target (Spending)" (Currency Input)
    - "Initial Investable Assets" (Currency Input)
    - "Expected Annual Return (%)" (Percentage Input, default 7%)
    - "Withdrawal Strategy" (Percentage Input, default 4%)
    - "The Finish Line" (Date Picker: Month/Year)
- **Action:** "Calculate & Start" saves to Dexie and flips the `isSetupComplete` flag.

#### Dashboard Shell (`DashboardView.tsx`)
- **Main Layout:** A persistent sidebar or top navigation with a content area.
- **Stat Cards (Initial Engine Output):**
    - **"Monthly Fuel Required":** The calculated monthly investment needed to reach the target.
    - **"Net Worth Goal":** Target monthly income / withdrawal rate.
    - **"Days to Freedom":** Time remaining until the target date.
- **Empty States:** Guidance for "Accounts" and "CSV Import" pages.

## Testing Strategy
- **Component Tests:** Verify form validation and view switching.
- **Storage Tests:** Ensure Dexie.js correctly saves and retrieves settings across page reloads.
- **PWA Audit:** Run Lighthouse to confirm basic PWA manifest and service worker configuration.

## Success Criteria
- **Immediate Value:** User sees their "Monthly Fuel" (required investment) based on their inputs upon finishing onboarding.
- **Persistence:** Refreshing the page maintains the user's dashboard view and data.
- **Performance:** App loads instantly (under 1s) on a standard mobile connection.
