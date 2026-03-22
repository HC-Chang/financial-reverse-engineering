import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { calculateAllocation } from '../../logic/engine';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import './RebalanceView.css';

const RebalanceView: React.FC = () => {
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  
  // Default target allocations
  const [targets, setTargets] = useState<Record<string, number>>({
    'Cash': 5,
    'Taxable': 45,
    'Roth': 25,
    'Traditional': 25
  });

  const allocations = useMemo(() => {
    return calculateAllocation(accounts || []);
  }, [accounts]);

  const totalAssets = useMemo(() => {
    return (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
  }, [accounts]);

  const handleTargetChange = (type: string, val: string) => {
    const num = parseFloat(val) || 0;
    setTargets(prev => ({ ...prev, [type]: num }));
  };

  const targetTotal = Object.values(targets).reduce((a, b) => a + b, 0);

  return (
    <div className="rebalance-container">
      <header className="rebalance-header">
        <h1>Asset Rebalancing</h1>
        <p>Align your current allocation with your long-term strategy.</p>
      </header>

      {totalAssets === 0 ? (
        <div className="empty-msg card">Add some accounts with balances to see your allocation.</div>
      ) : (
        <div className="rebalance-grid">
          <section className="allocation-section card">
            <h3>Current vs. Target</h3>
            {targetTotal !== 100 && (
              <p className="warning-msg">Warning: Your targets sum to {targetTotal}%, not 100%.</p>
            )}
            <div className="allocation-list">
              {allocations.map(alloc => {
                const target = targets[alloc.type] || 0;
                const drift = alloc.percentage - target;
                const driftValue = (drift / 100) * totalAssets;

                return (
                  <div key={alloc.type} className="allocation-row">
                    <div className="row-info">
                      <span className="type-label">{alloc.type}</span>
                      <span className="amount-label">{formatCurrency(alloc.total)} ({formatPercent(alloc.percentage)})</span>
                    </div>
                    
                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>Actual</span>
                        <span>Target</span>
                      </div>
                      <div className="multi-progress">
                        <div className="bar actual-bar" style={{ width: `${alloc.percentage}%` }}></div>
                        <div className="target-marker" style={{ left: `${target}%` }}></div>
                      </div>
                    </div>

                    <div className="drift-info">
                      <span className={`drift-tag ${drift > 2 ? 'over' : drift < -2 ? 'under' : 'neutral'}`}>
                        Drift: {drift > 0 ? '+' : ''}{drift.toFixed(1)}% ({formatCurrency(driftValue)})
                      </span>
                      <div className="target-input-group">
                        <label>Target %</label>
                        <input 
                          type="number" 
                          value={targets[alloc.type]} 
                          onChange={(e) => handleTargetChange(alloc.type, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="strategy-section card">
            <h3>Engine Suggestions</h3>
            <p>To reach your target allocation with your current {formatCurrency(totalAssets)} portfolio:</p>
            <div className="suggestions-list">
              {allocations.map(alloc => {
                const target = targets[alloc.type] || 0;
                const drift = alloc.percentage - target;
                const driftValue = (drift / 100) * totalAssets;

                if (Math.abs(drift) < 1) return null;

                return (
                  <div key={alloc.type} className={`suggestion-item ${drift > 0 ? 'sell' : 'buy'}`}>
                    <strong>{drift > 0 ? 'SELL' : 'BUY'}</strong> {formatCurrency(Math.abs(driftValue))} of <strong>{alloc.type}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default RebalanceView;
