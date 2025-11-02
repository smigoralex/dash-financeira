import { useState, useEffect, useRef } from 'react';
import { transactionService } from '../services/transactionService';
import { supabase } from '../lib/supabase';

export interface MonthlyBalance {
  month: string;
  entries: number;
  expenses: number;
}

export const useMonthlyBalances = () => {
  const [balances, setBalances] = useState<MonthlyBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const fetchBalances = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);
      const data = await transactionService.getMonthlyBalances();
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar saldos mensais');
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Carregar saldos mensais inicialmente
    fetchBalances();

    // Verificar se o usuário está autenticado antes de configurar subscription
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      // Configurar subscription em tempo real (se disponível no plano)
      const channel = supabase
        .channel('monthly-balances-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Escuta INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'transactions',
          },
          async (payload) => {
            console.log('Mudança detectada nos saldos mensais:', payload.eventType, payload);
            // Recarregar saldos imediatamente quando houver mudanças
            // Usar skipLoading=true para não mostrar loading em atualizações automáticas
            await fetchBalances(true);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time subscription ativa (monthly balances)');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Real-time não disponível (pode precisar de upgrade). Usando polling...');
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
      fetchBalances(true); // skipLoading para não mostrar loading
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
    balances,
    loading,
    error,
    refetch: fetchBalances,
  };
};
