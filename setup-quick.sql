-- ============================================
-- SETUP RÁPIDO - DESABILITAR RLS
-- ============================================
-- Copie e cole este script no SQL Editor do Supabase

-- 1. Criar tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- 3. DESABILITAR RLS (permite acesso sem autenticação)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ✅ Pronto! Agora você pode usar a aplicação sem autenticação.
