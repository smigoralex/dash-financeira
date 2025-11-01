import { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import { supabase } from '../lib/supabase';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carregar transações inicialmente
    fetchTransactions();

    // Configurar subscription em tempo real
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
        },
        async (payload) => {
          console.log('Mudança detectada:', payload.eventType);
          // Recarregar transações quando houver mudanças
          // Usar um pequeno delay para evitar múltiplas chamadas simultâneas
          setTimeout(() => {
            fetchTransactions();
          }, 100);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription ativa');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na subscription real-time');
        }
      });

    // Cleanup: remover subscription quando componente desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
};