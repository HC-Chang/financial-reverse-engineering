import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import { db } from '../../db/database';
import './SettingsView.css';

const SettingsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const [saveStatus, setSaveStatus] = useState('');
  
  const [formData, setFormData] = useState({
    targetMonthlyIncome: settings?.targetMonthlyIncome.toString() || '',
    initialAssets: settings?.initialAssets.toString() || '',
    annualReturn: settings?.annualReturn.toString() || '',
    withdrawalRate: settings?.withdrawalRate.toString() || '',
    targetDate: settings?.targetDate ? new Date(settings.targetDate).toISOString().split('T')[0] : '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      targetMonthlyIncome: parseFloat(formData.targetMonthlyIncome),
      initialAssets: parseFloat(formData.initialAssets),
      annualReturn: parseFloat(formData.annualReturn),
      withdrawalRate: parseFloat(formData.withdrawalRate),
      targetDate: new Date(formData.targetDate).toISOString(),
    });
    setSaveStatus(t('settings.success'));
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleExport = async () => {
    const data = {
      settings: await db.settings.get(1),
      accounts: await db.accounts.toArray(),
      transactions: await db.transactions.toArray(),
      subscriptions: await db.subscriptions.toArray(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-engine-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure? This will delete all your local data.')) {
      await db.transactions.clear();
      await db.accounts.clear();
      await db.subscriptions.clear();
      await db.settings.delete(1);
      window.location.reload();
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </header>

      <div className="settings-grid">
        <section className="settings-form-section card">
          <h3>{t('settings.engineConfig')}</h3>
          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label>{t('settings.targetIncome')}</label>
              <input 
                type="number" 
                value={formData.targetMonthlyIncome}
                onChange={(e) => setFormData({...formData, targetMonthlyIncome: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('settings.targetDate')}</label>
              <input 
                type="date" 
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.annualReturn')}</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.annualReturn}
                  onChange={(e) => setFormData({...formData, annualReturn: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.withdrawalRate')}</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.withdrawalRate}
                  onChange={(e) => setFormData({...formData, withdrawalRate: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="save-button">{t('common.save')}</button>
            {saveStatus && <p className="status-msg success">{saveStatus}</p>}
          </form>
        </section>

        <section className="management-section">
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>{t('settings.language')}</h3>
            <div className="language-toggle">
              <button 
                className={`secondary-button ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
                style={{ marginRight: '10px', backgroundColor: i18n.language === 'en' ? '#1abc9c' : '#34495e' }}
              >
                {t('settings.en')}
              </button>
              <button 
                className={`secondary-button ${i18n.language === 'zh-TW' ? 'active' : ''}`}
                onClick={() => changeLanguage('zh-TW')}
                style={{ backgroundColor: i18n.language === 'zh-TW' ? '#1abc9c' : '#34495e' }}
              >
                {t('settings.zhTW')}
              </button>
            </div>
          </div>

          <div className="card">
            <h3>{t('settings.dataManagement')}</h3>
            <div className="management-actions">
              <div className="action-item">
                <p>Download a local backup of all your data as a JSON file.</p>
                <button onClick={handleExport} className="secondary-button">{t('settings.exportBackup')}</button>
              </div>
              
              <div className="danger-zone">
                <h4>{t('settings.dangerZone')}</h4>
                <p>This will permanently erase all data stored in this browser.</p>
                <button onClick={handleClearData} className="danger-button">{t('settings.clearAll')}</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
