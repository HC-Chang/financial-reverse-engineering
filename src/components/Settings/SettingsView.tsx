import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/database';
import './SettingsView.css';

const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    targetMonthlyIncome: settings?.targetMonthlyIncome.toString() || '',
    initialAssets: settings?.initialAssets.toString() || '',
    annualReturn: settings?.annualReturn.toString() || '',
    withdrawalRate: settings?.withdrawalRate.toString() || '',
    targetDate: settings?.targetDate ? new Date(settings.targetDate).toISOString().split('T')[0] : '',
  });

  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    
    await updateSettings({
      targetMonthlyIncome: parseFloat(formData.targetMonthlyIncome),
      initialAssets: parseFloat(formData.initialAssets),
      annualReturn: parseFloat(formData.annualReturn),
      withdrawalRate: parseFloat(formData.withdrawalRate),
      targetDate: new Date(formData.targetDate).toISOString(),
    });

    setSaveStatus('Settings updated successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleExportData = async () => {
    const allAccounts = await db.accounts.toArray();
    const allTransactions = await db.transactions.toArray();
    const data = {
      settings,
      accounts: allAccounts,
      transactions: allTransactions,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-engine-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (window.confirm('CRITICAL: This will delete ALL local data (accounts, transactions, settings) and reset the app. This cannot be undone. Proceed?')) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Engine Settings</h1>
        <p>Fine-tune your financial parameters and manage your local data.</p>
      </header>

      <div className="settings-grid">
        <section className="params-section card">
          <h3>Core Parameters</h3>
          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label>Target Monthly Income ($)</label>
              <input 
                type="number" 
                value={formData.targetMonthlyIncome} 
                onChange={(e) => setFormData({...formData, targetMonthlyIncome: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Initial Investable Assets ($)</label>
              <input 
                type="number" 
                value={formData.initialAssets} 
                onChange={(e) => setFormData({...formData, initialAssets: e.target.value})} 
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Annual Return (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.annualReturn} 
                  onChange={(e) => setFormData({...formData, annualReturn: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Withdrawal Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.withdrawalRate} 
                  onChange={(e) => setFormData({...formData, withdrawalRate: e.target.value})} 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Target Date</label>
              <input 
                type="date" 
                value={formData.targetDate} 
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})} 
              />
            </div>
            <button type="submit" className="save-button">Update Engine Parameters</button>
            {saveStatus && <p className="status-msg success">{saveStatus}</p>}
          </form>
        </section>

        <section className="data-management card">
          <h3>Data Management</h3>
          <div className="management-actions">
            <div className="action-item">
              <p>Download a local JSON backup of all your accounts and transactions.</p>
              <button onClick={handleExportData} className="secondary-button">Export Data (JSON)</button>
            </div>
            
            <div className="danger-zone">
              <h4>Danger Zone</h4>
              <p>Permanently delete all local data and reset the engine to factory defaults.</p>
              <button onClick={handleClearData} className="danger-button">Clear All Data</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
