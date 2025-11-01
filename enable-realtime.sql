-- ============================================
-- HABILITAR REAL-TIME NO SUPABASE
-- ============================================
-- Execute este script no SQL Editor do Supabase para habilitar atualizações em tempo real

-- Habilitar replicação para a tabela transactions
-- Isso permite que mudanças sejam detectadas em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Se o comando acima não funcionar, use este:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- ============================================
-- VERIFICAR SE ESTÁ HABILITADO
-- ============================================
-- Execute para verificar se a replicação está ativa:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ✅ Pronto! Agora as mudanças na tabela serão detectadas em tempo real.
