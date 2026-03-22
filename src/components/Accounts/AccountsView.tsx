import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Account, Transaction } from '../../types/financial';
import { formatCurrency } from '../../utils/formatters';
import { calculateAccountBalance } from '../../logic/engine';
import './AccountsView.css';

const AccountRow: React.FC<{ account: Account; transactions: Transaction[] }> = ({ account, transactions }) => {
  const calculatedBalance = calculateAccountBalance(transactions, 0); 
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
      <td><span className={`type-badge ${account.type.toLowerCase()}`}>{account.type}</span></td>
      <td>
        <div className="balance-cell">
          {formatCurrency(account.balance)}
          {hasDiscrepancy && (
            <button 
              className="sync-button" 
              title={`Discrepancy! Transaction sum: ${formatCurrency(calculatedBalance)}`}
              onClick={handleSync}
            >
              Sync
            </button>
          )}
        </div>
      </td>
      <td>
        <button 
          onClick={handleDelete}
          className="delete-button"
        >
          &times;
        </button>
      </td>
    </tr>
  );
};

const AccountsView: React.FC = () => {
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

    await db.accounts.add({
      name: formData.name,
      balance: parseFloat(formData.balance),
      type: formData.type,
      lastUpdated: new Date().toISOString(),
    });

    setFormData({ name: '', balance: '', type: 'Cash' });
  };

  return (
    <div className="accounts-container">
      <header className="accounts-header">
        <h1>Financial Accounts</h1>
        <p>Manage your assets across different categories.</p>
      </header>

      <div className="accounts-grid">
        <section className="add-account-section">
          <div className="card">
            <h3>Add New Account</h3>
            <form onSubmit={handleAddAccount} className="account-form">
              <div className="form-group">
                <label>Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chase Checking"
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Balance</label>
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
                <label>Account Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Taxable">Taxable Brokerage</option>
                  <option value="Roth">Roth IRA/401k</option>
                  <option value="Traditional">Traditional IRA/401k</option>
                </select>
              </div>
              <button type="submit" className="add-button">Add Account</button>
            </form>
          </div>
        </section>

        <section className="accounts-list-section">
          <div className="card">
            <h3>Your Accounts</h3>
            {accounts && accounts.length > 0 ? (
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Balance</th>
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
              <p className="empty-msg">No accounts added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountsView;
