-- ============================================
-- VERIFICAR E CORRIGIR PROBLEMAS DE AUTENTICAÇÃO
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há usuários na tabela auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Verificar políticas RLS na tabela transactions
SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- 3. Se as políticas não estão funcionando, recriar:
-- Remover todas as políticas antigas
DROP POLICY IF EXISTS "Allow all operations" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- Garantir que RLS está habilitado
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. (OPCIONAL) Para testes, confirmar email manualmente de um usuário
-- Substitua 'email@exemplo.com' pelo email que você quer confirmar
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW()
-- WHERE email = 'email@exemplo.com';

-- 5. (OPCIONAL) Ver transações de um usuário específico
-- SELECT * FROM transactions WHERE user_id = 'ID_DO_USUARIO';
