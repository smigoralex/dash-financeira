# 🔧 Solução de Problemas - Autenticação

## ❌ Problema: Senha não está entrando

### Possíveis causas e soluções:

### 1. Email não confirmado (MUITO COMUM)

O Supabase por padrão exige confirmação de email antes de permitir login.

#### Solução A: Confirmar email manualmente (Recomendado para testes)

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/jqkweclckepkdkselqgk
2. Vá em **Authentication** > **Users**
3. Encontre seu usuário na lista
4. Clique nos 3 pontos (⋮) ao lado do usuário
5. Selecione **"Confirm email"**

Agora você poderá fazer login!

#### Solução B: Desabilitar confirmação de email (Apenas para desenvolvimento)

1. Acesse **Authentication** > **Providers** > **Email**
2. Desabilite a opção **"Confirm email"**
3. Salve as alterações

⚠️ **ATENÇÃO**: Reative a confirmação em produção!

### 2. Verificar se usuário foi criado

Execute este SQL no SQL Editor do Supabase:

```sql
-- Ver todos os usuários
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;
```

Se o `email_confirmed_at` estiver `NULL`, o email não foi confirmado.

### 3. Verificar políticas RLS

Execute no SQL Editor:

```sql
-- Ver políticas ativas
SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- Se não houver políticas ou estiverem erradas, execute:
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Allow all operations" ON transactions;

-- Criar políticas corretas
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Testar login diretamente no Supabase

1. Vá em **Authentication** > **Users**
2. Clique no usuário
3. Tente fazer reset de senha daqui para testar

### 5. Ver logs de autenticação

1. Vá em **Authentication** > **Logs**
2. Veja se há erros de login registrados

## ✅ Checklist de Verificação

- [ ] Email foi confirmado? (Verificar em Authentication > Users)
- [ ] Confirmação de email está desabilitada para testes?
- [ ] Políticas RLS estão configuradas corretamente?
- [ ] Senha tem pelo menos 6 caracteres?
- [ ] Email está correto (sem espaços, formato válido)?
- [ ] URL de redirecionamento está configurada no Supabase?

## 🔍 Debug no Console

Abra o Console do navegador (F12) e verifique:
- Se há erros do Supabase
- Mensagens de autenticação
- Status do usuário após login

## 📝 Nota Importante

**Não é necessário criar tabela `users`!**

O Supabase usa automaticamente a tabela `auth.users` para autenticação. Você só precisa:
- ✅ Tabela `transactions` com campo `user_id`
- ✅ Políticas RLS configuradas
- ✅ Email confirmado (ou confirmação desabilitada para testes)
