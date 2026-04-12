import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/database';
import { formatCurrency } from '../../utils/formatters';
import './TransactionsView.css';

const TransactionsView: React.FC = () => {
  const { t } = useTranslation();
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState<number | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');

  const categories = useMemo(() => {
    if (!transactions) return [];
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAccount = filterAccount === 'all' || t.accountId === filterAccount;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesAccount && matchesCategory;
    });
  }, [transactions, searchTerm, filterAccount, filterCategory]);

  const handleDelete = async (id?: number) => {
    if (id && window.confirm('Delete this transaction?')) {
      await db.transactions.delete(id);
    }
  };

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>{t('transactions.title')}</h1>
        <p>{t('transactions.subtitle')}</p>
      </header>

      <section className="transactions-filters card">
        <div className="filter-group">
          <label>{t('transactions.description')}</label>
          <input 
            type="text" 
            placeholder={t('transactions.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>{t('accounts.title')}</label>
          <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">{t('transactions.filterAccount')}</option>
            {accounts?.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{t('transactions.category')}</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">{t('transactions.filterCategory')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="transactions-list card">
        {filteredTransactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>{t('transactions.date')}</th>
                <th>{t('transactions.description')}</th>
                <th>{t('transactions.category')}</th>
                <th>{t('accounts.title')}</th>
                <th>{t('transactions.amount')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => {
                const account = accounts?.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className={t.amount < 0 ? 'expense' : 'income'}>
                    <td className="date-cell">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="desc-cell"><strong>{t.description}</strong></td>
                    <td><span className="cat-badge">{t.category}</span></td>
                    <td className="account-cell">{account?.name || 'Unknown'}</td>
                    <td className="amount-cell">{formatCurrency(t.amount)}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(t.id)}>&times;</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="empty-msg">{t('common.noData')}</p>
        )}
      </div>
    </div>
  );
};

export default TransactionsView;
