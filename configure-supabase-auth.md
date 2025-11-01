# 🔐 Configurar Autenticação no Supabase

## 1. Configurar URL de Redirecionamento

Para que o link de confirmação de email funcione corretamente:

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/jqkweclckepkdkselqgk
2. Vá em **Authentication** > **URL Configuration**
3. Em **Redirect URLs**, adicione as seguintes URLs:

### URLs para adicionar:

**Produção (Netlify):**
```
https://seu-site.netlify.app
https://seu-site.netlify.app/**
```

**Desenvolvimento local (opcional):**
```
http://localhost:5173
http://localhost:5173/**
http://192.168.*.*:5173
http://192.168.*.*:5173/**
```

### Exemplo:
Se seu site Netlify for `https://dash-financeira.netlify.app`, adicione:
- `https://dash-financeira.netlify.app`
- `https://dash-financeira.netlify.app/**`

O `/**` permite redirecionamentos para qualquer página do site.

## 2. Configurar Site URL

Na mesma página (**Authentication** > **URL Configuration**):

1. Em **Site URL**, coloque a URL principal do seu site:
   - **Produção**: `https://seu-site.netlify.app`
   - **Desenvolvimento**: `http://localhost:5173`

## 3. (Opcional) Desabilitar Confirmação de Email para Testes

Se quiser testar localmente sem confirmação de email:

1. Vá em **Authentication** > **Providers** > **Email**
2. Desabilite **"Confirm email"**

⚠️ **Atenção**: Isso só para desenvolvimento. Em produção, mantenha a confirmação habilitada.

## 4. Verificar Políticas RLS

Certifique-se de que as políticas RLS estão ativas:

Execute o SQL do arquivo `enable-auth-rls.sql` no SQL Editor.

## ✅ Pronto!

Agora quando um usuário se cadastrar:
1. Receberá um email de confirmação
2. Ao clicar no link, será redirecionado para sua aplicação (não mais localhost)
3. Poderá fazer login normalmente
