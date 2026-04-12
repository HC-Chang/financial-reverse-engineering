import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../../db/database';
import { Account, Transaction } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';
import { calculateAccountBalance } from '../../logic/engine';
import './AccountsView.css';

const AccountRow: React.FC<{ account: Account; transactions: Transaction[] }> = ({ account, transactions }) => {
  const { t } = useTranslation();
  const calculatedBalance = calculateAccountBalance(transactions, account.openingBalance || 0); 
  const hasDiscrepancy = Math.abs(account.balance - calculatedBalance) > 0.01 && transactions.length > 0;

  const handleSync = async () => {
    if (account.id) {
      await db.accounts.update(account.id, { balance: calculatedBalance });
    }
  };

  const handleDelete = async () => {
    if (account.id) {
      await db.accounts.delete(account.id);
    }
  };

  return (
    <tr key={account.id}>
      <td>{account.name}</td>
      <td>
        <span className={`type-badge ${account.type.toLowerCase()}`}>
          {t(`accounts.types.${account.type}`)}
        </span>
      </td>
      <td>
        <div className="balance-cell">
          {formatCurrency(account.balance)}
          {hasDiscrepancy && (
            <button 
              className="sync-button" 
              title={t('accounts.discrepancy', { amount: formatCurrency(calculatedBalance) })}
              onClick={handleSync}
            >
              {t('common.sync')}
            </button>
          )}
        </div>
      </td>
      <td>
        <button 
          onClick={handleDelete}
          className="delete-button"
          title={t('common.delete')}
        >
          &times;
        </button>
      </td>
    </tr>
  );
};

const AccountsView: React.FC = () => {
  const { t } = useTranslation();
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    type: 'Cash' as Account['type'],
  });

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.balance) return;

    const initialBalance = parseFloat(formData.balance);

    await db.accounts.add({
      name: formData.name,
      balance: initialBalance,
      openingBalance: initialBalance,
      type: formData.type,
      lastUpdated: new Date().toISOString(),
    });

    setFormData({ name: '', balance: '', type: 'Cash' });
  };

  return (
    <div className="accounts-container">
      <header className="accounts-header">
        <h1>{t('accounts.title')}</h1>
        <p>{t('accounts.subtitle')}</p>
      </header>

      <div className="accounts-grid">
        <section className="add-account-section">
          <div className="card">
            <h3>{t('accounts.addNew')}</h3>
            <form onSubmit={handleAddAccount} className="account-form">
              <div className="form-group">
                <label>{t('accounts.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chase Checking"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('accounts.balance')}</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('accounts.type')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
                >
                  <option value="Cash">{t('accounts.types.Cash')}</option>
                  <option value="Taxable">{t('accounts.types.Taxable')}</option>
                  <option value="Roth">{t('accounts.types.Roth')}</option>
                  <option value="Traditional">{t('accounts.types.Traditional')}</option>
                </select>
              </div>
              <button type="submit" className="add-button">{t('accounts.add')}</button>
            </form>
          </div>
        </section>

        <section className="accounts-list-section">
          <div className="card">
            <h3>{t('accounts.yourAccounts')}</h3>
            {accounts && accounts.length > 0 ? (
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>{t('accounts.name')}</th>
                    <th>{t('accounts.type')}</th>
                    <th>{t('accounts.balance')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <AccountRow 
                      key={account.id} 
                      account={account} 
                      transactions={transactions?.filter(t => t.accountId === account.id) || []} 
                    />
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-msg">{t('common.noData')}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountsView;
