-- ============================================
-- HABILITAR AUTENTICAÇÃO COM RLS
-- ============================================
-- Execute este script no SQL Editor do Supabase para habilitar autenticação segura

-- 1. Habilitar RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 2. Remover política antiga (se existir)
DROP POLICY IF EXISTS "Allow all operations" ON transactions;

-- 3. Política para SELECT: usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Política para INSERT: usuários podem inserir suas próprias transações
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Política para UPDATE: usuários podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Política para DELETE: usuários podem excluir suas próprias transações
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ✅ Pronto! Agora cada usuário só pode ver e gerenciar suas próprias transações.
