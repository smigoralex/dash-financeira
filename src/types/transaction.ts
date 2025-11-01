export type TransactionType = 'entrada' | 'saida';

export interface Transaction {
  id: string;
  user_id?: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  created_at?: string;
}

export interface TransactionInput {
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
}

export interface MonthlyBalance {
  month: string;
  year: number;
  monthYear: string;
  totalEntries: number;
  totalExpenses: number;
  balance: number;
}
