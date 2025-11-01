import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';

export const useTotalBalance = () => {
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const balance = await transactionService.getTotalBalance();
      setTotalBalance(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar saldo total');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    totalBalance,
    loading,
    error,
    refetch: fetchBalance,
  };
};
