import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { FinancialSettings } from '../types/financial';

interface SettingsContextType {
  settings: FinancialSettings | undefined;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<FinancialSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const settings = useLiveQuery(() => db.settings.get(1), [], null);
  const isLoading = settings === null;

  const updateSettings = async (newSettings: Partial<FinancialSettings>) => {
    const currentSettings = await db.settings.get(1);
    if (currentSettings) {
      await db.settings.update(1, newSettings);
    } else {
      await db.settings.add({
        id: 1,
        targetMonthlyIncome: 0,
        initialAssets: 0,
        annualReturn: 0,
        withdrawalRate: 0,
        targetDate: new Date().toISOString(),
        isSetupComplete: false,
        ...newSettings,
      } as FinancialSettings);
    }
  };

  const value = useMemo(() => ({
    settings: settings === null ? undefined : settings,
    isLoading,
    updateSettings,
  }), [settings, isLoading]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
