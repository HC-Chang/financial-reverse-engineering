import { parseCSV, autoDetectMapping, generateTransactionHash } from './src/logic/csvMapper';

const csvContent = `Date,Description,Amount,Category
2026-03-22,Grocery Store,-50.25,Food
2026-03-21,Employer,3000.00,Salary`;

const parsed = parseCSV(csvContent);
console.log('Parsed Rows:', JSON.stringify(parsed, null, 2));
console.log('Parsed Rows Count:', parsed.length);

if (parsed.length === 3) {
  console.log('✅ CSV Parsing: Correct number of rows.');
} else {
  console.log('❌ CSV Parsing: Incorrect number of rows.');
}

const mapping = autoDetectMapping(parsed[0]);
console.log('Auto-detected Mapping:', JSON.stringify(mapping, null, 2));

if (mapping.dateIndex === 0 && mapping.descriptionIndex === 1 && mapping.amountIndex === 2) {
  console.log('✅ Mapping Detection: Headers correctly identified.');
} else {
  console.log('❌ Mapping Detection: Incorrect identification.');
}

const t1 = { accountId: 1, date: '2026-03-22', amount: -50.25, description: 'Grocery Store', category: 'Food' };
const h1 = generateTransactionHash(t1);
const h2 = generateTransactionHash(t1);

if (h1 === h2) {
  console.log('✅ Hash Generation: Consistent for identical data.');
} else {
  console.log('❌ Hash Generation: Inconsistent.');
}

const t2 = { ...t1, amount: -50.26 };
const h3 = generateTransactionHash(t2);

if (h1 !== h3) {
  console.log('✅ Hash Generation: Different for modified data.');
} else {
  console.log('❌ Hash Generation: Collision for different data.');
}
