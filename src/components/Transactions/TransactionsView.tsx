import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Transaction } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';
import SpendingTrends from '../Common/SpendingTrends';
import './TransactionsView.css';

const TransactionsView: React.FC = () => {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []);
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<number | 'all'>('all');

  const filteredTransactions = transactions?.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAccount = selectedAccountId === 'all' || t.accountId === selectedAccountId;
    return matchesSearch && matchesAccount;
  });

  const handleDelete = async (id?: number) => {
    if (id && window.confirm('Delete this transaction?')) {
      await db.transactions.delete(id);
    }
  };

  const getAccountName = (id: number) => {
    return accounts?.find(a => a.id === id)?.name || 'Unknown Account';
  };

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>Transaction History</h1>
        <p>Review and manage your imported financial data.</p>
      </header>

      {transactions && transactions.length > 0 && (
        <section className="trends-section card">
          <h3>Spending Trends (Last 6 Months)</h3>
          <SpendingTrends transactions={transactions} />
        </section>
      )}

      <div className="transactions-filters card">
        <div className="filter-group">
          <label>Search</label>
          <input 
            type="text" 
            placeholder="Search description or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Account</label>
          <select 
            value={selectedAccountId} 
            onChange={(e) => setSelectedAccountId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Accounts</option>
            {accounts?.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="transactions-list card">
        {filteredTransactions && filteredTransactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className={t.amount < 0 ? 'expense' : 'income'}>
                  <td className="date-cell">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="account-cell">{getAccountName(t.accountId)}</td>
                  <td className="desc-cell">{t.description}</td>
                  <td className="category-cell"><span className="cat-badge">{t.category}</span></td>
                  <td className="amount-cell">{formatCurrency(t.amount)}</td>
                  <td>
                    <button onClick={() => handleDelete(t.id)} className="delete-btn">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-msg">No transactions found matching your filters.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionsView;
