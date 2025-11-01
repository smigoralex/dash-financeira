# 💰 Gestão Financeira

Uma aplicação web moderna para gerenciamento financeiro pessoal, desenvolvida com React, TypeScript, TailwindCSS e Supabase.

## 🚀 Funcionalidades

- ✅ Adicionar receitas (entradas) e despesas (saídas)
- ✅ Visualizar todas as transações em uma tabela
- ✅ Exibir saldo geral acumulado
- ✅ Exibir saldo mensal por mês
- ✅ Histórico de saldos mensais
- ✅ Excluir transações
- ✅ Feedback visual de sucesso/erro
- ✅ Interface responsiva e moderna

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)

## 🛠️ Configuração do Projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

#### Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto e aguarde a criação

#### Criar tabela no Supabase

Após criar o projeto, acesse o SQL Editor no painel do Supabase e execute o seguinte SQL:

```sql
-- Criar tabela de transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índice para melhor performance
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Habilitar Row Level Security (RLS) - opcional para autenticação
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (caso não use autenticação)
-- Se você quiser usar autenticação, ajuste as políticas conforme necessário
CREATE POLICY "Allow all operations" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Nota:** Se você não vai usar autenticação por enquanto, pode desabilitar o RLS:

```sql
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

#### Obter credenciais do Supabase

1. No painel do Supabase, vá em **Settings** > **API**
2. Copie a **URL** do projeto
3. Copie a **anon/public key**

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

**Exemplo:**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Executar o projeto

### Modo de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

### Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist`.

### Preview da build

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
gestao-financeira/
├── src/
│   ├── components/          # Componentes React
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionTable.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/               # Custom hooks
│   │   ├── useTransactions.ts
│   │   ├── useMonthlyBalances.ts
│   │   └── useTotalBalance.ts
│   ├── lib/                 # Configurações
│   │   └── supabase.ts
│   ├── services/            # Serviços de API
│   │   └── transactionService.ts
│   ├── types/               # Tipos TypeScript
│   │   └── transaction.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Supabase** - Backend (banco de dados + API)
- **react-hot-toast** - Notificações
- **date-fns** - Manipulação de datas

## 🔒 Segurança

- As variáveis de ambiente não devem ser commitadas no Git
- Para produção, configure adequadamente as políticas de RLS no Supabase
- Use autenticação se precisar de controle de acesso por usuário

## 📝 Próximas Melhorias

- [ ] Autenticação completa com usuários
- [ ] Categorização de transações
- [ ] Filtros e busca na tabela
- [ ] Gráficos de evolução financeira
- [ ] Exportação de dados (CSV/PDF)
- [ ] Edição de transações
- [ ] Metas e orçamentos mensais

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
