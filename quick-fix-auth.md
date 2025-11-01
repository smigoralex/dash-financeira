# 🚨 SOLUÇÃO RÁPIDA - Login Não Funciona

## ⚠️ CAUSA MAIS COMUM: Email não confirmado

O Supabase **exige confirmação de email** antes de permitir login!

## ✅ SOLUÇÃO RÁPIDA (2 minutos):

### Opção 1: Confirmar email manualmente (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard/project/jqkweclckepkdkselqgk
2. Vá em **Authentication** > **Users**
3. Encontre seu email na lista
4. Clique nos **3 pontos (⋮)** ao lado do usuário
5. Selecione **"Confirm email"** ou **"Send confirmation email"**
6. Pronto! Agora você pode fazer login

### Opção 2: Desabilitar confirmação (APENAS PARA TESTES)

1. Vá em **Authentication** > **Providers** > **Email**
2. **Desabilite** a opção **"Confirm email"**
3. Salve

⚠️ **ATENÇÃO**: Reative depois para produção!

## 🔍 Verificar Status do Usuário

Execute este SQL no SQL Editor:

```sql
SELECT 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC;
```

Se `email_confirmed_at` for `NULL`, o email não foi confirmado!

## ❌ Não precisa criar tabela users!

O Supabase gerencia automaticamente a tabela `auth.users`. Você só precisa:
- ✅ Tabela `transactions` (já criada)
- ✅ Políticas RLS (já configuradas)
- ✅ Email confirmado (você precisa fazer isso)
