-- ============================================
-- Script de configuração do Supabase
-- Gestão Financeira - Tabela de Transações
-- ============================================

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- OPÇÃO 1: Política para permitir todas as operações (sem autenticação)
-- Use esta opção se NÃO vai usar autenticação por enquanto
-- ============================================

-- Desabilitar RLS temporariamente (se não usar autenticação)
-- ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- OU criar política permissiva
DROP POLICY IF EXISTS "Allow all operations" ON transactions;
CREATE POLICY "Allow all operations" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- OPÇÃO 2: Políticas para autenticação (recomendado para produção)
-- Use esta opção se vai usar autenticação
-- ============================================

-- Política para SELECT: usuários podem ver apenas suas próprias transações
-- DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
-- CREATE POLICY "Users can view own transactions" ON transactions
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- Política para INSERT: usuários podem inserir suas próprias transações
-- DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
-- CREATE POLICY "Users can insert own transactions" ON transactions
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar suas próprias transações
-- DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
-- CREATE POLICY "Users can update own transactions" ON transactions
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- Política para DELETE: usuários podem excluir suas próprias transações
-- DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
-- CREATE POLICY "Users can delete own transactions" ON transactions
--   FOR DELETE
--   USING (auth.uid() = user_id);

-- ============================================
-- Verificar tabela criada
-- ============================================
-- SELECT * FROM transactions LIMIT 10;
