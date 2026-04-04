# Spending Trends & Subscription Optimization Implementation Plan

**Goal:** Provide actionable insights into spending leaks and visualize monthly cash flow trends.

**Architecture:** 
- A new `subscriptions` table in IndexedDB to store user-confirmed recurring expenses.
- Enhanced detection logic with frequency support (monthly/quarterly).
- A "Subscription Leak" component for the Dashboard.
- A "Spending Breakdown" view with category-based visualization.

---

### Task 1: Database & Type Updates

- [x] **Step 1: Update Transaction types and add Subscription type**
- [x] **Step 2: Update Dexie schema to include subscriptions**

### Task 2: Advanced Subscription Detection Engine

- [x] **Step 1: Refactor `detectSubscriptions` to find multiple frequencies**
- [x] **Step 2: Add confidence scoring to detections**

### Task 3: Subscription Management UI

- [x] **Step 1: Update `SubscriptionView` to allow "Confirm" or "Dismiss"**
- [x] **Step 2: Show impact of confirmed subscriptions on "Days to Freedom"**

### Task 4: Spending Trends Visualization

- [x] **Step 1: Create a `SpendingTrends` component with a bar/area chart**
- [x] **Step 2: Integrate into Dashboard or new "Trends" view**

### Task 5: Dashboard Alerts

- [x] **Step 1: Add "New Subscriptions Detected" alert to Dashboard**
- [x] **Step 2: Add "Monthly Cash Flow" summary card**
