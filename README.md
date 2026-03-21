# Financial Reverse Engineering Engine (V1)

A modern, "engine-first" financial dashboard designed to calculate the exact monthly investment ("Fuel") required to reach your financial freedom target. Unlike typical budgeting apps, this system prioritizes mathematical projections and automated optimization.

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

## 📖 Tutorial Guide

### Step 1: The Onboarding Wizard
When you first open the app, you'll be greeted by the **Onboarding Wizard**. This form captures the key parameters needed to calculate your financial "finish line":

1.  **Your Monthly Target (Spending):** Enter the amount you want to be able to spend each month (in today's dollars) once you reach financial independence.
2.  **Initial Investable Assets:** Enter the total value of your current investments (stocks, bonds, cash, etc.).
3.  **Expected Annual Return (%):** Enter your projected long-term annual return (default is 7%).
4.  **Withdrawal Strategy (%):** Enter your planned annual withdrawal rate (default is the standard 4% rule).
5.  **The Finish Line:** Select the month and year you'd like to reach financial independence.

Click **"Calculate & Start"** to persist your data locally and view your results.

### Step 2: Understanding the Dashboard
Once onboarding is complete, you'll see your personalized **Financial Freedom Dashboard**:

- **Monthly Fuel Required:** This is the core "engine" output. It tells you exactly how much you need to invest *each month* to reach your target by your chosen date.
- **Net Worth Goal:** This represents your "Freedom Number"—the total assets you need to sustain your target monthly spending based on your withdrawal rate.
- **Days to Freedom:** A real-time countdown to your target date.

### Step 3: Local Persistence & PWA
- **Data Privacy:** All your financial data is stored locally in your browser's **IndexedDB** (via Dexie.js). No data is sent to a server.
- **Offline Use:** This app is a Progressive Web App (PWA). You can install it on your home screen or desktop and use it even when you're offline.

---

## 🛠 Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Persistence:** Dexie.js (IndexedDB)
- **Math:** Custom Logic Engine (PMT formula)
- **Styling:** Vanilla CSS (Financial Theme)
- **PWA:** `vite-plugin-pwa`

---

## 📂 Detailed Documentation
For more in-depth technical details, check out the `docs/` folder:
- [System Design Spec](./docs/superpowers/specs/2026-03-21-dashboard-shell-design.md)
- [Implementation Plan](./docs/superpowers/plans/2026-03-21-dashboard-shell.md)
- [Original Product Vision](./docs/superpowers/specs/2026-03-19-financial-reverse-engineering-design.md)
