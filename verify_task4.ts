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
console.log('Calculated Monthly Fuel:', results.monthlyFuel);
if (results.monthlyFuel > 7500 && results.monthlyFuel < 8500) {
  console.log('✅ Monthly Fuel calculation seems reasonable.');
} else {
  console.log('❌ Monthly Fuel calculation seems off.');
}

// Projection tests
if (results.projection.length >= 120 && results.projection.length <= 122) {
  console.log('✅ Projection length is correct (approx 120 months).');
} else {
  console.log('❌ Projection length is incorrect. Got:', results.projection.length);
}

const lastPoint = results.projection[results.projection.length - 1];
if (Math.abs(lastPoint.balance - expectedNetWorth) < 1.0) {
  console.log('✅ Projection reaches the net worth goal.');
} else {
  console.log('❌ Projection does not reach net worth goal. Final balance:', lastPoint.balance);
}

const firstPoint = results.projection[0];
if (firstPoint.balance === testSettings.initialAssets) {
  console.log('✅ Projection starts with initial assets.');
} else {
  console.log('❌ Projection does not start with initial assets. First balance:', firstPoint.balance);
}
