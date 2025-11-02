# 🔄 Verificar e Habilitar Real-time no Supabase

## Passo 1: Verificar se o Real-time está habilitado

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá em Database > Replication:**
   - No menu lateral, clique em **Database**
   - Depois clique em **Replication**

3. **Verifique se `transactions` está habilitado:**
   - Procure pela tabela `transactions`
   - Deve estar marcada com ✅ (habilitada)
   - Se não estiver, clique no toggle para habilitar

## Passo 2: Se não estiver habilitado, execute este SQL

1. **Vá em SQL Editor:**
   - No menu lateral, clique em **SQL Editor**

2. **Execute este comando:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
   ```

3. **Verifique se funcionou:**
   - Execute este comando para confirmar:
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```
   - Você deve ver a tabela `transactions` na lista

## Passo 3: Verificar se está funcionando

Após habilitar:

1. **Abra o console do navegador** (F12 > Console)
2. **Adicione uma nova transação**
3. **Verifique os logs:**
   - Você deve ver: `✅ Real-time subscription ativa`
   - Quando adicionar uma transação, deve ver: `Mudança detectada: INSERT`

## ⚠️ Troubleshooting

### Não vejo os logs de subscription
- Verifique se está logado
- Verifique se o Real-time está habilitado (passo 1)
- Recarregue a página

### Subscription ativa mas não atualiza
- Verifique se o RLS está configurado corretamente
- Verifique os logs do console para erros
- Tente desabilitar e reabilitar o Real-time

### Erro "channel error"
- Verifique a conexão com a internet
- Verifique se o Supabase está acessível
- Tente recarregar a página

---

**Pronto!** Após habilitar o Real-time, os cards devem atualizar automaticamente em tempo real! 🎉
