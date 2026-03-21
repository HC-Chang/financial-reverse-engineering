import Dexie, { type EntityTable } from 'dexie';
import { FinancialSettings } from '../types/financial';

export class FinancialDatabase extends Dexie {
  settings!: EntityTable<FinancialSettings, 'id'>;

  constructor() {
    super('FinancialDatabase');
    this.version(1).stores({
      settings: '++id'
    });
  }
}

export const db = new FinancialDatabase();
