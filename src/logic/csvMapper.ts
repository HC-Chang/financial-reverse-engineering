import { Transaction } from '../types/financial';

export interface CSVMapping {
  dateIndex: number;
  amountIndex: number;
  descriptionIndex: number;
  categoryIndex?: number;
}

export const parseCSV = (content: string): string[][] => {
  const lines = content.split(/\r?\n/);
  return lines
    .filter(line => line.trim().length > 0)
    .map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
};

export const autoDetectMapping = (headers: string[]): CSVMapping => {
  const mapping: Partial<CSVMapping> = {};
  
  headers.forEach((header, index) => {
    const h = header.toLowerCase();
    if (h.includes('date')) mapping.dateIndex = index;
    if (h.includes('amount') || h.includes('total')) mapping.amountIndex = index;
    if (h.includes('description') || h.includes('payee') || h.includes('name')) mapping.descriptionIndex = index;
    if (h.includes('category')) mapping.categoryIndex = index;
  });

  return {
    dateIndex: mapping.dateIndex ?? 0,
    amountIndex: mapping.amountIndex ?? 1,
    descriptionIndex: mapping.descriptionIndex ?? 2,
    categoryIndex: mapping.categoryIndex,
  };
};

export const generateTransactionHash = (t: Omit<Transaction, 'id' | 'hash'>): string => {
  const str = `${t.accountId}-${t.date}-${t.amount}-${t.description}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};
