import Dexie, { type EntityTable } from 'dexie';
import { FinancialSettings, Account, Transaction, Subscription } from '../types/financial';

export class FinancialDatabase extends Dexie {
  settings!: EntityTable<FinancialSettings, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  subscriptions!: EntityTable<Subscription, 'id'>;

  constructor() {
    super('FinancialDatabase');
    this.version(2).stores({
      settings: '++id',
      accounts: '++id, name, type',
      transactions: '++id, accountId, date, hash, isSubscription',
      subscriptions: '++id, description, status'
    });
  }
}

export const db = new FinancialDatabase();
