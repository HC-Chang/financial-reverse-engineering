import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/SettingsContext';
import './OnboardingView.css';

const OnboardingView: React.FC = () => {
  const { t } = useTranslation();
  const { updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    targetMonthlyIncome: '',
    initialAssets: '',
    annualReturn: '7',
    withdrawalRate: '4',
    targetDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.targetMonthlyIncome || parseFloat(formData.targetMonthlyIncome) <= 0) {
      newErrors.targetMonthlyIncome = 'Please enter a valid monthly income goal.';
    }
    if (!formData.initialAssets || parseFloat(formData.initialAssets) < 0) {
      newErrors.initialAssets = 'Please enter valid initial assets.';
    }
    const annualReturn = parseFloat(formData.annualReturn);
    if (isNaN(annualReturn) || annualReturn < 0 || annualReturn > 20) {
      newErrors.annualReturn = 'Please enter a realistic return rate (0-20%).';
    }
    const withdrawalRate = parseFloat(formData.withdrawalRate);
    if (isNaN(withdrawalRate) || withdrawalRate < 1 || withdrawalRate > 10) {
      newErrors.withdrawalRate = 'Safe withdrawal rates are typically between 2-6%.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      updateSettings({
        targetMonthlyIncome: parseFloat(formData.targetMonthlyIncome),
        initialAssets: parseFloat(formData.initialAssets),
        annualReturn: parseFloat(formData.annualReturn),
        withdrawalRate: parseFloat(formData.withdrawalRate),
        targetDate: new Date(formData.targetDate).toISOString(),
        isSetupComplete: true,
      });
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>{t('onboarding.title')}</h1>
        <p>{t('onboarding.subtitle')}</p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label>{t('onboarding.incomeGoal')}</label>
            <span className="form-help">{t('onboarding.incomeHelp')}</span>
            <input
              type="number"
              value={formData.targetMonthlyIncome}
              onChange={(e) => setFormData({ ...formData, targetMonthlyIncome: e.target.value })}
              placeholder="e.g. 5000"
              required
            />
            {errors.targetMonthlyIncome && <span className="error-message">{errors.targetMonthlyIncome}</span>}
          </div>

          <div className="form-group">
            <label>{t('onboarding.currentAssets')}</label>
            <span className="form-help">{t('onboarding.assetsHelp')}</span>
            <input
              type="number"
              value={formData.initialAssets}
              onChange={(e) => setFormData({ ...formData, initialAssets: e.target.value })}
              placeholder="e.g. 50000"
              required
            />
            {errors.initialAssets && <span className="error-message">{errors.initialAssets}</span>}
          </div>

          <div className="form-group">
            <label>{t('onboarding.targetDate')}</label>
            <span className="form-help">{t('onboarding.dateHelp')}</span>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              required
            />
          </div>

          <div className="math-parameters">
            <h3>{t('onboarding.mathParameters')}</h3>
            <p className="form-help">{t('onboarding.mathHelp')}</p>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>{t('settings.annualReturn')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.annualReturn}
                  onChange={(e) => setFormData({ ...formData, annualReturn: e.target.value })}
                />
                {errors.annualReturn && <span className="error-message">{errors.annualReturn}</span>}
              </div>
              <div className="form-group">
                <label>{t('settings.withdrawalRate')}</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.withdrawalRate}
                  onChange={(e) => setFormData({ ...formData, withdrawalRate: e.target.value })}
                />
                {errors.withdrawalRate && <span className="error-message">{errors.withdrawalRate}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="onboarding-button">{t('onboarding.start')}</button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingView;
