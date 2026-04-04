import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import './OnboardingView.css';

const OnboardingView: React.FC = () => {
  const { updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    targetMonthlyIncome: '',
    initialAssets: '',
    annualReturn: '7',
    withdrawalRate: '4',
    targetDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.targetMonthlyIncome || parseFloat(formData.targetMonthlyIncome) <= 0) {
      newErrors.targetMonthlyIncome = 'Please enter a valid monthly target.';
    }
    
    if (!formData.initialAssets || parseFloat(formData.initialAssets) < 0) {
      newErrors.initialAssets = 'Initial assets cannot be negative.';
    }
    
    const annualReturn = parseFloat(formData.annualReturn);
    if (isNaN(annualReturn)) {
      newErrors.annualReturn = 'Please enter a valid annual return.';
    }

    const withdrawalRate = parseFloat(formData.withdrawalRate);
    if (isNaN(withdrawalRate) || withdrawalRate <= 0) {
      newErrors.withdrawalRate = 'Withdrawal rate must be greater than 0.';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Please select a target date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      await updateSettings({
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
        <h1>Welcome</h1>
        <p>Let's map out your financial finish line. Enter your parameters to see the engine in action.</p>
        
        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="targetMonthlyIncome">Your Monthly Target (Spending)</label>
            <p className="form-help">How much you want to spend each month in today's dollars.</p>
            <input
              type="number"
              id="targetMonthlyIncome"
              name="targetMonthlyIncome"
              value={formData.targetMonthlyIncome}
              onChange={handleChange}
              placeholder="e.g. 5000"
              required
            />
            {errors.targetMonthlyIncome && <span className="error-message">{errors.targetMonthlyIncome}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="initialAssets">Initial Investable Assets</label>
            <p className="form-help">Total current value of your stocks, bonds, and cash.</p>
            <input
              type="number"
              id="initialAssets"
              name="initialAssets"
              value={formData.initialAssets}
              onChange={handleChange}
              placeholder="e.g. 50000"
              required
            />
            {errors.initialAssets && <span className="error-message">{errors.initialAssets}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="annualReturn">Expected Annual Return (%)</label>
            <p className="form-help">Projected long-term growth (Inflation-adjusted). S&P 500 average is ~7%.</p>
            <input
              type="number"
              id="annualReturn"
              name="annualReturn"
              value={formData.annualReturn}
              onChange={handleChange}
              step="0.1"
              required
            />
            {errors.annualReturn && <span className="error-message">{errors.annualReturn}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="withdrawalRate">Withdrawal Strategy (%)</label>
            <p className="form-help">The percentage of assets you'll spend annually (e.g. the 4% rule).</p>
            <input
              type="number"
              id="withdrawalRate"
              name="withdrawalRate"
              value={formData.withdrawalRate}
              onChange={handleChange}
              step="0.1"
              required
            />
            {errors.withdrawalRate && <span className="error-message">{errors.withdrawalRate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">The Finish Line</label>
            <p className="form-help">When do you want to be financially free?</p>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              required
            />
            {errors.targetDate && <span className="error-message">{errors.targetDate}</span>}
          </div>

          <button type="submit" className="onboarding-button">
            Calculate My Freedom
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingView;
