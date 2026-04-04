import React, { useMemo } from 'react';
import { Transaction } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';
import { startOfMonth, format, subMonths, isSameMonth, parseISO } from 'date-fns';

interface SpendingTrendsProps {
  transactions: Transaction[];
  months?: number;
}

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ transactions, months = 6 }) => {
  const data = useMemo(() => {
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = startOfMonth(subMonths(now, i));
      const monthLabel = format(monthDate, 'MMM');
      const monthKey = format(monthDate, 'yyyy-MM');
      
      const monthTransactions = transactions.filter(t => 
        t.amount < 0 && isSameMonth(parseISO(t.date), monthDate)
      );

      const total = Math.abs(monthTransactions.reduce((sum, t) => sum + t.amount, 0));
      
      // Group by category for this month
      const categories: Record<string, number> = {};
      monthTransactions.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
      });

      result.push({
        label: monthLabel,
        key: monthKey,
        total,
        categories
      });
    }

    return result;
  }, [transactions, months]);

  const maxTotal = Math.max(...data.map(d => d.total), 100);
  const chartHeight = 150;
  const barWidth = 40;
  const gap = 20;
  const width = data.length * (barWidth + gap);

  return (
    <div className="spending-trends-wrapper" style={{ width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
      <svg width={width} height={chartHeight + 30} className="spending-trends-svg">
        {data.map((d, i) => {
          const x = i * (barWidth + gap);
          const barHeight = (d.total / maxTotal) * chartHeight;
          const y = chartHeight - barHeight;

          return (
            <g key={d.key}>
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                fill="#ecf0f1" 
                rx={4}
              />
              {/* Stacked categories could go here, but starting simple with total */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                fill="#3498db" 
                rx={4}
                opacity={0.8}
              />
              <text 
                x={x + barWidth / 2} 
                y={chartHeight + 20} 
                textAnchor="middle" 
                style={{ fontSize: '12px', fill: '#7f8c8d' }}
              >
                {d.label}
              </text>
              <text 
                x={x + barWidth / 2} 
                y={y - 5} 
                textAnchor="middle" 
                style={{ fontSize: '10px', fill: '#2c3e50', fontWeight: 'bold' }}
              >
                {Math.round(d.total / 1000)}k
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SpendingTrends;
