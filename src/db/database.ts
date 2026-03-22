import Dexie, { type EntityTable } from 'dexie';
import { FinancialSettings, Account } from '../types/financial';

export class FinancialDatabase extends Dexie {
  settings!: EntityTable<FinancialSettings, 'id'>;
  accounts!: EntityTable<Account, 'id'>;

  constructor() {
    super('FinancialDatabase');
    this.version(1).stores({
      settings: '++id',
      accounts: '++id, name, type'
    });
  }
}

export const db = new FinancialDatabase();
