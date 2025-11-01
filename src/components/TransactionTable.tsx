import { useState, useMemo } from 'react';
import { Transaction } from '../types/transaction';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';
import { HiSearch, HiTrash, HiDocumentText, HiCalendar } from 'react-icons/hi';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: () => void;
  loading?: boolean;
}

export const TransactionTable = ({ transactions, onDelete, loading }: TransactionTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      await transactionService.delete(id);
      toast.success('Transação excluída com sucesso!');
      onDelete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir transação');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Obter meses únicos das transações
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse(); // Mais recentes primeiro
  }, [transactions]);

  // Formatar mês para exibição
  const formatMonthOption = (monthYear: string) => {
    try {
      const [year, month] = monthYear.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return monthYear;
    }
  };

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDateShort(transaction.date).includes(searchTerm);

      const matchesType = filterType === 'all' || transaction.type === filterType;

      // Filtro por mês
      const matchesMonth =
        filterMonth === 'all' ||
        (() => {
          const date = new Date(transaction.date);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return monthYear === filterMonth;
        })();

      return matchesSearch && matchesType && matchesMonth;
    });
  }, [transactions, searchTerm, filterType, filterMonth]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Transações</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Transações</h2>
        <div className="text-center py-12">
          <HiDocumentText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            Nenhuma transação cadastrada ainda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Transações</h2>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Busca */}
          <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <HiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filtro por mês */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 pl-10 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">Todos os meses</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthOption(month)}
                </option>
              ))}
            </select>
            <HiCalendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <svg
              className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'entrada' | 'saida')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="entrada">Receitas</option>
            <option value="saida">Despesas</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma transação encontrada com os filtros aplicados.</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="sm:hidden space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateShort(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-base font-bold ${
                        transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'entrada' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                        transaction.type === 'entrada'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="mt-3 w-full text-center text-sm text-red-600 hover:text-red-800 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <HiTrash className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'entrada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                      <span
                        className={
                          transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {transaction.type === 'entrada' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors px-2 py-1 rounded hover:bg-red-50 flex items-center justify-center gap-1 mx-auto"
                      >
                        <HiTrash className="w-4 h-4" />
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center sm:text-left">
              Mostrando {filteredTransactions.length} de {transactions.length} transações
            </p>
          </div>
        </>
      )}
    </div>
  );
};