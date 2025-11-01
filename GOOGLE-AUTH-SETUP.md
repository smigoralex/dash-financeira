# 🔐 Configuração do Login com Google

Este guia explica como configurar o login com Google no seu projeto Supabase.

## 📋 Passo a Passo

### 1. Criar Credenciais no Google Cloud Console

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com/
   - Faça login com sua conta Google

2. **Criar um novo projeto (ou selecionar existente):**
   - Clique em "Selecionar projeto" no topo
   - Clique em "Novo Projeto"
   - Digite um nome (ex: "Gestão Financeira")
   - Clique em "Criar"

3. **Configurar a Tela de Consentimento OAuth:**
   - No menu lateral, vá em "APIs e serviços" > "Tela de consentimento OAuth"
   - Selecione "Externo" (ou "Interno" se for apenas para usuários da sua organização)
   - Clique em "Criar"
   - Preencha:
     - **Nome do app**: Gestão Financeira (ou o nome que preferir)
     - **Email de suporte ao usuário**: seu email
     - **Email de contato do desenvolvedor**: seu email
   - Clique em "Salvar e continuar"
   - Pule as etapas de "Escopos" e "Usuários de teste" (clique em "Salvar e continuar")
   - Na etapa "Resumo", clique em "Voltar para o painel"

4. **Criar Credenciais OAuth:**
   - No menu lateral, vá em "APIs e serviços" > "Credenciais"
   - Clique em "+ CRIAR CREDENCIAIS" > "ID do cliente OAuth"
   - Selecione "Aplicativo da Web"
   - **Nome**: Gestão Financeira (ou o nome que preferir)
   - **URIs de redirecionamento autorizados**: Adicione estas URLs:
     ```
     http://localhost:5173
     http://localhost:5173/
     https://seu-projeto.netlify.app
     https://seu-projeto.netlify.app/
     https://[SEU-PROJETO-SUPABASE].supabase.co/auth/v1/callback
     ```
     > ⚠️ **Importante**: Substitua `[SEU-PROJETO-SUPABASE]` pelo ID do seu projeto Supabase (encontre em: Supabase Dashboard > Settings > API > Project URL)
   - Clique em "Criar"

5. **Copiar as Credenciais:**
   - Após criar, você verá:
     - **ID do Cliente** (Client ID)
     - **Segredo do Cliente** (Client Secret)
   - **IMPORTANTE**: Copie e guarde essas informações (você precisará delas no próximo passo)

---

### 2. Configurar no Supabase

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá em Autenticação:**
   - No menu lateral, clique em "Authentication"
   - Depois clique em "Providers"

3. **Habilitar o Google Provider:**
   - Encontre "Google" na lista de provedores
   - Clique no toggle para **ativar** o Google
   - Preencha:
     - **Client ID (OAuth Client ID)**: Cole o ID do Cliente que você copiou do Google Cloud Console
     - **Client Secret (OAuth Client Secret)**: Cole o Segredo do Cliente
   - Clique em "Save"

---

### 3. Testar o Login com Google

1. **Execute a aplicação:**
   ```bash
   npm run dev
   ```

2. **Teste o botão:**
   - Acesse a página de login
   - Clique no botão "Continuar com Google"
   - Você será redirecionado para o Google
   - Faça login com sua conta Google
   - Autorize o acesso
   - Você será redirecionado de volta para a aplicação, já logado!

---

## 🚨 Troubleshooting

### Erro: "redirect_uri_mismatch"
- **Causa**: A URL de redirecionamento não está autorizada no Google Cloud Console
- **Solução**: 
  1. Vá no Google Cloud Console > Credenciais
  2. Clique no seu OAuth Client ID
  3. Adicione a URL exata que aparece no erro em "URIs de redirecionamento autorizados"
  4. Salve e aguarde alguns minutos para propagar

### Erro: "OAuth client not found"
- **Causa**: O Client ID ou Client Secret estão incorretos no Supabase
- **Solução**: 
  1. Verifique se copiou corretamente as credenciais
  2. No Supabase, desative e ative novamente o Google provider
  3. Cole novamente as credenciais

### O botão abre mas dá erro no Google
- **Causa**: A tela de consentimento OAuth não está configurada corretamente
- **Solução**: 
  1. Vá no Google Cloud Console > Tela de consentimento OAuth
  2. Certifique-se de que preencheu todos os campos obrigatórios
  3. Pode levar alguns minutos para as mudanças serem propagadas

### Login funciona mas o usuário não aparece na aplicação
- **Causa**: Pode ser um problema com as políticas RLS ou com o código
- **Solução**: 
  1. Verifique se as políticas RLS estão corretas (usuários podem criar suas próprias transações)
  2. Verifique os logs do navegador (F12 > Console)
  3. Verifique se o `user_id` está sendo salvo corretamente nas transações

---

## ✅ Checklist de Configuração

- [ ] Criado projeto no Google Cloud Console
- [ ] Configurada a Tela de Consentimento OAuth
- [ ] Criado OAuth Client ID e Secret
- [ ] Adicionados URIs de redirecionamento (localhost + produção)
- [ ] Habilitado Google Provider no Supabase
- [ ] Inseridas credenciais corretas no Supabase
- [ ] Testado login com Google em localhost
- [ ] Testado login com Google em produção (após deploy)

---

## 📚 Referências

- [Documentação Supabase - Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Explained](https://oauth.net/2/)

---

**Pronto!** 🎉 Agora seus usuários podem fazer login com Google de forma rápida e segura!
