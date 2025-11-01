import { supabase } from '../lib/supabase';
import { Transaction, TransactionInput } from '../types/transaction';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  async create(transaction: TransactionInput): Promise<Transaction> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Garantir que só deleta suas próprias transações

    if (error) {
      throw new Error(error.message);
    }
  },

  async getMonthlyBalances(): Promise<{ month: string; entries: number; expenses: number }[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('date, amount, type')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return [];

    // Agrupar por mês/ano
    const monthlyData = data.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthYear]) {
        acc[monthYear] = { entries: 0, expenses: 0 };
      }

      if (transaction.type === 'entrada') {
        acc[monthYear].entries += transaction.amount;
      } else {
        acc[monthYear].expenses += transaction.amount;
      }

      return acc;
    }, {} as Record<string, { entries: number; expenses: number }>);

    return Object.entries(monthlyData).map(([month, values]) => ({
      month,
      ...values,
    })).sort((a, b) => b.month.localeCompare(a.month));
  },

  async getTotalBalance(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return 0;

    return data.reduce((total, transaction) => {
      if (transaction.type === 'entrada') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  },
};