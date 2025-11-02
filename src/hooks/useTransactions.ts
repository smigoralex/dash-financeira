import { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import { supabase } from '../lib/supabase';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const fetchTransactions = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Carregar transações inicialmente
    fetchTransactions();

    // Verificar se o usuário está autenticado antes de configurar subscription
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ Usuário não autenticado, pulando subscription real-time');
        return null;
      }

      // Configurar subscription em tempo real (se disponível no plano)
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
            console.log('Mudança detectada:', payload.eventType, payload);
            // Recarregar transações imediatamente quando houver mudanças
            // Usar skipLoading=true para não mostrar loading em atualizações automáticas
            await fetchTransactions(true);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time subscription ativa');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Real-time não disponível (pode precisar de upgrade). Usando polling...');
            // Se real-time falhar, não é problema - o polling vai manter atualizado
          } else if (status === 'TIMED_OUT') {
            console.warn('⏱️ Subscription real-time timeout');
          } else if (status === 'CLOSED') {
            console.log('🔒 Subscription real-time fechada');
          }
        });

      return channel;
    };

    setupSubscription().then((ch) => {
      channelRef.current = ch;
    });

    // Polling como fallback/alternativa ao Real-time
    // Atualiza a cada 5 segundos automaticamente
    const pollingInterval = setInterval(() => {
      fetchTransactions(true); // skipLoading para não mostrar loading
    }, 5000); // 5 segundos

    // Cleanup: remover subscription e polling quando componente desmontar
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(pollingInterval);
    };
  }, []);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
};