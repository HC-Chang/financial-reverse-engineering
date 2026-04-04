# Financial Reverse Engineering Engine (V1)

A modern, "engine-first" financial dashboard designed to calculate the exact monthly investment ("Fuel") required to reach your financial freedom target. Unlike typical budgeting apps, this system prioritizes mathematical projections, historical stress testing, and automated optimization.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (installed with Node.js)

### 2. Installation
Clone the repository and install the dependencies:
```bash
# Clone the repository (if applicable)
# git clone <repository-url>
# cd financial-reverse-engineering

# Install dependencies
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173` to start using the app.

---

## 📖 Key Features

### 1. The Financial Freedom Engine
Calculates your "Monthly Fuel"—the exact amount you need to invest each month to reach your target by your chosen date, using standard financial formulas (PMT).

### 2. Historical Resilience (Monte Carlo)
Stress-test your plan against 100 years of real market data (S&P 500 returns and CPI inflation since 1926).
- **Resilience Score:** See what percentage of historical market cycles your plan survives.
- **Scenario Deep Dive:** Click on any historical era (like the Great Depression or 2008) to see an SVG visualization of how your portfolio would have performed.
- **Stress Gap:** Calculate exactly how much extra fuel or time you need to make your plan "bulletproof" against every historical crash.

### 3. Asset Rebalancing
Monitor your current allocation across Cash, Taxable, Roth, and Traditional accounts.
- **Drift Analysis:** Automatically calculates how far you've drifted from your target allocation.
- **Engine Suggestions:** Provides specific BUY/SELL orders to bring your portfolio back into alignment.

### 4. Tax Strategy & Optimization
- **Retirement Tax Estimation:** Projects your effective tax rate in retirement based on current US tax brackets.
- **Contribution Waterfall:** Provides a prioritized order of operations (Match -> Roth/HSA -> Trad -> Taxable) to minimize lifetime tax liability.

### 5. Subscription Audit
Import your transaction CSVs to automatically detect recurring "leaks" in your financial engine. See the annual impact of every subscription you maintain.

### 6. Privacy-First Data
- **Local Persistence:** All your financial data is stored locally in your browser's **IndexedDB** (via Dexie.js). No data is sent to a server.
- **Offline Use:** This app is a Progressive Web App (PWA). You can install it on your home screen or desktop and use it even when you're offline.

---

## 🛠 Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Visuals:** SVG Area Charts (Dependency-free)
- **Persistence:** Dexie.js (IndexedDB)
- **Math:** Custom Logic Engine & Monte Carlo Simulator
- **Styling:** Vanilla CSS (Modern Financial Theme)
- **PWA:** `vite-plugin-pwa`

---

## 📂 Detailed Documentation
For more in-depth technical details, check out the `docs/` folder:
- [Interactive Visualizations Plan](./docs/superpowers/plans/2026-04-02-interactive-visualizations.md)
- [Monte Carlo Stress Test Design](./docs/superpowers/specs/2026-03-28-monte-carlo-stress-test-design.md)
- [System Design Spec](./docs/superpowers/specs/2026-03-21-dashboard-shell-design.md)
