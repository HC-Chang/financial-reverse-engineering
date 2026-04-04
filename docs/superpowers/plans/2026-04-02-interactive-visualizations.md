# Interactive Visualizations & Historical Deep Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static tables with responsive SVG charts and add a "Scenario Deep Dive" to the Monte Carlo view to visualize drawdown and recovery.

**Architecture:** 
- A lightweight, dependency-free SVG Area Chart component for projection and scenario replay.
- State-driven "Deep Dive" in the Monte Carlo view allowing users to select and "replay" specific historical eras.

**Tech Stack:** React, TypeScript, SVG, Vanilla CSS.

---

### Task 1: Reusable AreaChart Component

**Files:**
- Create: `src/components/Common/AreaChart.tsx`
- Create: `src/components/Common/AreaChart.css`

- [ ] **Step 1: Implement the SVG AreaChart component**

```tsx
import React, { useMemo } from 'react';
import './AreaChart.css';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  width = 500, 
  height = 200, 
  color = '#1abc9c' 
}) => {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    
    const maxX = Math.max(...data.map(p => p.x));
    const maxY = Math.max(...data.map(p => p.y)) || 1;
    const minX = Math.min(...data.map(p => p.x));

    const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const scaleY = (y: number) => height - (y / maxY) * height;

    return data.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ');
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (!points) return '';
    return `M 0,${height} L ${points} L ${width},${height} Z`;
  }, [points, width, height]);

  return (
    <div className="area-chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="area-chart-svg">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGradient)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default AreaChart;
```

- [ ] **Step 2: Add styles for AreaChart**

```css
.area-chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.area-chart-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
```

- [ ] **Step 3: Commit chart component**

```bash
git add src/components/Common/
git commit -m "feat: add reusable SVG AreaChart component"
```

### Task 2: Integrate Chart into Dashboard

**Files:**
- Modify: `src/components/Dashboard/DashboardView.tsx`

- [ ] **Step 1: Replace Milestones table with AreaChart**

```tsx
// src/components/Dashboard/DashboardView.tsx
// ... imports
import AreaChart from '../Common/AreaChart';

// ... inside component
const chartData = useMemo(() => {
  return results.projection.map((p, i) => ({
    x: i,
    y: p.balance,
    label: new Date(p.date).toLocaleDateString()
  }));
}, [results.projection]);

// ... in JSX
<section className="dashboard-charts card" style={{ marginTop: '1.5rem' }}>
  <h3>Wealth Projection</h3>
  <div style={{ height: '250px', marginTop: '1rem' }}>
    <AreaChart data={chartData} height={250} />
  </div>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.8rem' }}>
    <span>Today</span>
    <span>Goal ({formatCurrency(results.netWorthGoal)})</span>
  </div>
</section>
```

- [ ] **Step 2: Commit Dashboard updates**

```bash
git add src/components/Dashboard/DashboardView.tsx
git commit -m "feat: replace projection table with interactive Area Chart"
```

### Task 3: Historical Deep Dive Engine Update

**Files:**
- Modify: `src/logic/monteCarloEngine.ts`

- [ ] **Step 1: Add runHistoricalScenario function**

```typescript
export interface ScenarioPoint {
  month: number;
  balance: number;
  date: string;
}

export const runHistoricalScenario = (
  settings: FinancialSettings,
  startYear: string
): ScenarioPoint[] => {
  const { initialAssets, targetDate } = settings;
  const now = new Date();
  const target = parseISO(targetDate);
  const horizonMonths = Math.max(1, differenceInMonths(target, now));
  const { monthlyFuel } = calculateRequiredFuel(settings);

  const startIndex = historicalData.findIndex(d => d.date.startsWith(startYear));
  if (startIndex === -1) return [];

  const points: ScenarioPoint[] = [];
  let balance = initialAssets;
  const startCPI = historicalData[startIndex].cpi;

  for (let m = 0; m < horizonMonths && (startIndex + m) < historicalData.length; m++) {
    const data = historicalData[startIndex + m];
    const inflationFactor = data.cpi / startCPI;
    balance = balance * (1 + data.sp500) + monthlyFuel * inflationFactor;
    
    points.push({
      month: m,
      balance,
      date: data.date
    });

    if (balance <= 0) {
       // Keep filling with 0 to maintain chart horizon if desired, or break
       break;
    }
  }

  return points;
};
```

- [ ] **Step 2: Commit engine update**

```bash
git commit -am "feat: add detailed historical scenario replay logic"
```

### Task 4: Historical Deep Dive UI

**Files:**
- Modify: `src/components/MonteCarlo/MonteCarloView.tsx`
- Modify: `src/components/MonteCarlo/MonteCarloView.css`

- [ ] **Step 1: Implement state for selected era and render deep dive chart**

```tsx
const [selectedEra, setSelectedEra] = useState<string | null>(null);

const scenarioData = useMemo(() => {
  if (!selectedEra || !settings) return null;
  const points = runHistoricalScenario(settings, selectedEra);
  return points.map(p => ({ x: p.month, y: p.balance, label: p.date }));
}, [selectedEra, settings]);

// In failure/success list:
// onClick={() => setSelectedEra(wc.startDate.split('-')[0])}
// className="failure-item clickable"
```

- [ ] **Step 2: Add CSS for clickable items**

```css
.clickable {
  cursor: pointer;
  transition: all 0.2s;
}
.clickable:hover {
  background: rgba(26, 188, 156, 0.1);
  transform: translateX(5px);
}
```

- [ ] **Step 3: Commit interactive Deep Dive**

```bash
git commit -am "feat: implement interactive historical deep dive with SVG visualization"
```
