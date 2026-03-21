import { calculateRequiredFuel } from './src/logic/engine';
import { FinancialSettings } from './src/types/financial';
import { addYears, formatISO } from 'date-fns';

const testSettings: FinancialSettings = {
  targetMonthlyIncome: 5000,
  initialAssets: 50000,
  annualReturn: 7,
  withdrawalRate: 4,
  targetDate: formatISO(addYears(new Date(), 10)),
  isSetupComplete: true,
};

const results = calculateRequiredFuel(testSettings);

console.log('Test Settings:', JSON.stringify(testSettings, null, 2));
console.log('Results:', JSON.stringify(results, null, 2));

// Expected Net Worth Goal: (5000 * 12) / 0.04 = 60000 / 0.04 = 1,500,000
const expectedNetWorth = 1500000;
if (Math.abs(results.netWorthGoal - expectedNetWorth) < 0.01) {
  console.log('✅ Net Worth Goal calculation is correct.');
} else {
  console.log('❌ Net Worth Goal calculation is incorrect. Expected:', expectedNetWorth, 'Got:', results.netWorthGoal);
}

// Days to freedom should be around 3652 (10 years)
if (results.daysToFreedom >= 3650 && results.daysToFreedom <= 3654) {
  console.log('✅ Days to Freedom calculation is roughly correct.');
} else {
  console.log('❌ Days to Freedom calculation is incorrect. Got:', results.daysToFreedom);
}

// Monthly fuel: using PMT formula for $1.5M goal from $50k initial, 7% return, 10 years (120 months)
// PMT = (FV * r) / ((1 + r)^n - 1) - (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
// r = 0.07 / 12 = 0.0058333
// n = 120
// FV = 1500000
// PV = 50000
// (1+r)^n = (1.0058333)^120 = 2.010
// term1 = (1500000 * 0.0058333) / (2.010 - 1) = 8750 / 1.01 = 8663
// term2 = (50000 * 0.0058333 * 2.010) / (2.010 - 1) = 586 / 1.01 = 580
// monthlyFuel = 8663 - 580 = 8083 approx
console.log('Calculated Monthly Fuel:', results.monthlyFuel);
if (results.monthlyFuel > 7500 && results.monthlyFuel < 8500) {
  console.log('✅ Monthly Fuel calculation seems reasonable.');
} else {
  console.log('❌ Monthly Fuel calculation seems off.');
}
