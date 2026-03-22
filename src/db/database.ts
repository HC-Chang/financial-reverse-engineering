import Dexie, { type EntityTable } from 'dexie';
import { FinancialSettings, Account, Transaction } from '../types/financial';

export class FinancialDatabase extends Dexie {
  settings!: EntityTable<FinancialSettings, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;

  constructor() {
    super('FinancialDatabase');
    this.version(1).stores({
      settings: '++id',
      accounts: '++id, name, type',
      transactions: '++id, accountId, date, hash'
    });
  }
}

export const db = new FinancialDatabase();
