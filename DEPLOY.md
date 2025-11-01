# 🚀 Guia de Deploy - Netlify

## Passo 1: Criar repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (ou use o botão **+** no canto superior direito)
3. Configure o repositório:
   - **Name**: `gestao-financeira` (ou outro nome de sua escolha)
   - **Description**: "Aplicação web de gestão financeira com React e Supabase"
   - Deixe como **Public** ou **Private** (sua escolha)
   - **NÃO** marque "Initialize with README" (já temos arquivos)
4. Clique em **"Create repository"**

## Passo 2: Conectar repositório local ao GitHub

Execute os seguintes comandos no terminal (substitua `SEU_USUARIO` pelo seu usuário do GitHub):

```bash
# Adicionar o remote do GitHub
git remote add origin https://github.com/SEU_USUARIO/gestao-financeira.git

# Renomear branch principal (se necessário)
git branch -M main

# Fazer push para o GitHub
git push -u origin main
```

**Ou se preferir usar SSH:**
```bash
git remote add origin git@github.com:SEU_USUARIO/gestao-financeira.git
git branch -M main
git push -u origin main
```

## Passo 3: Deploy no Netlify

### Opção A: Deploy via Interface Web (Recomendado)

1. Acesse [netlify.com](https://netlify.com) e faça login (pode usar conta GitHub)
2. No dashboard, clique em **"Add new site"** > **"Import an existing project"**
3. Conecte ao **GitHub** e autorize o Netlify
4. Selecione o repositório `gestao-financeira`
5. Configure o build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - O Netlify deve detectar automaticamente (arquivo `netlify.toml` já está configurado)
6. Clique em **"Deploy site"**

### Opção B: Deploy via Netlify CLI

```bash
# Instalar Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# Fazer login
netlify login

# Inicializar e fazer deploy
netlify init
netlify deploy --prod
```

## Passo 4: Configurar Variáveis de Ambiente no Netlify

**IMPORTANTE:** As variáveis de ambiente precisam ser configuradas no Netlify!

1. No dashboard do Netlify, vá em **Site settings** > **Environment variables**
2. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon do Supabase

### Como encontrar suas variáveis do Supabase:

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## Passo 5: Habilitar Real-time no Supabase

Execute este SQL no SQL Editor do Supabase:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
```

## ✅ Pronto!

Após o deploy, sua aplicação estará disponível em:
- URL gerada automaticamente pelo Netlify (ex: `https://seu-projeto.netlify.app`)
- Você pode personalizar o domínio em **Site settings** > **Domain management**

## 🔄 Deploys Automáticos

O Netlify faz deploy automático sempre que você fizer push para o branch `main` no GitHub!

Para fazer atualizações:
```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

O Netlify detectará automaticamente e fará um novo deploy.

## 🐛 Troubleshooting

### Build falha no Netlify
- Verifique se todas as variáveis de ambiente estão configuradas
- Veja os logs do build em **Deploys** > **Deploy log**

### Aplicação não conecta ao Supabase
- Verifique se as variáveis de ambiente estão corretas
- Certifique-se que o RLS está desabilitado ou as políticas estão corretas

### Real-time não funciona
- Execute o SQL `enable-realtime.sql` no Supabase
- Verifique os logs do console do navegador
