import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';

export interface MonthlyBalance {
  month: string;
  entries: number;
  expenses: number;
}

export const useMonthlyBalances = () => {
  const [balances, setBalances] = useState<MonthlyBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getMonthlyBalances();
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar saldos mensais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  return {
    balances,
    loading,
    error,
    refetch: fetchBalances,
  };
};
