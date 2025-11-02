import { useState, useMemo, useRef } from 'react';
import { Transaction } from '../types/transaction';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';
import { HiSearch, HiTrash, HiPencil, HiCalendar, HiFilter, HiX } from 'react-icons/hi';
import { EmptyState } from './EmptyState';
import { EditTransactionModal } from './EditTransactionModal';
import { Tooltip } from './Tooltip';
import { SkeletonLoader } from './SkeletonLoader';
import { ScrollIndicator } from './ScrollIndicator';
import { useDebounce } from '../hooks/useDebounce';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: () => void;
  loading?: boolean;
}

export const TransactionTable = ({ transactions, onDelete, loading }: TransactionTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  
  // Debounce na busca para melhor performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedMinValue = useDebounce(minValue, 300);
  const debouncedMaxValue = useDebounce(maxValue, 300);

  const handleDelete = async (id: string) => {
    // Melhorar feedback de confirmação
    if (!window.confirm('Tem certeza que deseja excluir esta transação?\n\nEsta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await transactionService.delete(id);
      toast.success('Transação excluída com sucesso! 🗑️', {
        duration: 3000,
        icon: '✅',
      });
      onDelete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir transação', {
        duration: 4000,
      });
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
      // Filtro por busca (usando debouncedSearchTerm para melhor performance)
      const matchesSearch =
        transaction.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        formatDateShort(transaction.date).includes(debouncedSearchTerm);

      const matchesType = filterType === 'all' || transaction.type === filterType;

      // Filtro por mês
      const matchesMonth =
        filterMonth === 'all' ||
        (() => {
          const date = new Date(transaction.date);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          return monthYear === filterMonth;
        })();

      // Filtro por período
      const matchesPeriod =
        filterPeriod === 'all' ||
        (() => {
          const transactionDate = new Date(transaction.date);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

          switch (filterPeriod) {
            case '7days':
              return diffDays <= 7;
            case '30days':
              return diffDays <= 30;
            case '90days':
              return diffDays <= 90;
            case 'thisMonth':
              return (
                transactionDate.getMonth() === now.getMonth() &&
                transactionDate.getFullYear() === now.getFullYear()
              );
            case 'lastMonth':
              const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              return (
                transactionDate.getMonth() === lastMonth.getMonth() &&
                transactionDate.getFullYear() === lastMonth.getFullYear()
              );
            default:
              return true;
          }
        })();

      // Filtro por faixa de valor
      const matchesValueRange =
        (!debouncedMinValue || transaction.amount >= parseFloat(debouncedMinValue)) &&
        (!debouncedMaxValue || transaction.amount <= parseFloat(debouncedMaxValue));

      return matchesSearch && matchesType && matchesMonth && matchesPeriod && matchesValueRange;
    });
  }, [
    transactions,
    debouncedSearchTerm,
    filterType,
    filterMonth,
    filterPeriod,
    debouncedMinValue,
    debouncedMaxValue,
  ]);

  // Loading skeleton
  if (loading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 transition-colors">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Transações</h2>
        <div className="relative">
          <EmptyState
            type="transactions"
            message="Comece registrando suas receitas e despesas para ter um controle completo das suas finanças."
            actionLabel="Adicionar primeira transação"
            onAction={() => {
              // Scroll para o formulário
              const formElement = document.querySelector('[data-transaction-form]');
              formElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Tentar expandir o formulário
              const expandButton = document.querySelector('[data-expand-form]') as HTMLElement;
              expandButton?.click();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">Transações</h2>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Busca */}
          <Tooltip content="Busque por descrição da transação" position="bottom">
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <input
                type="text"
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Buscar transações"
              />
              <HiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </Tooltip>

          {/* Filtro por mês */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 pl-10 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
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
          <Tooltip content="Filtrar por tipo de transação" position="bottom">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'entrada' | 'saida')}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              aria-label="Filtrar por tipo"
            >
              <option value="all">Todos</option>
              <option value="entrada">Receitas</option>
              <option value="saida">Despesas</option>
            </select>
          </Tooltip>

          {/* Botão para mostrar/ocultar filtros avançados */}
          <Tooltip content={showAdvancedFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'} position="bottom">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 text-sm border rounded-lg transition-all flex items-center gap-2 ${
                showAdvancedFilters
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label={showAdvancedFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
            >
              <HiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </Tooltip>
        </div>

        {/* Filtros Avançados */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 animate-slideUp transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <HiFilter className="w-4 h-4" />
                Filtros Avançados
              </h3>
              <button
                onClick={() => {
                  setFilterPeriod('all');
                  setMinValue('');
                  setMaxValue('');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                aria-label="Limpar filtros avançados"
              >
                <HiX className="w-4 h-4" />
                Limpar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por Período */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Período</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                  aria-label="Filtrar por período"
                >
                  <option value="all">Todos os períodos</option>
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="90days">Últimos 90 dias</option>
                  <option value="thisMonth">Este mês</option>
                  <option value="lastMonth">Mês passado</option>
                </select>
              </div>

              {/* Filtro por Valor Mínimo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Valor Mínimo (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                    aria-label="Valor mínimo"
                  />
                </div>
              </div>

              {/* Filtro por Valor Máximo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Valor Máximo (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 text-sm">R$</span>
                  <input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    placeholder="999999.99"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                    aria-label="Valor máximo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredTransactions.length === 0 && transactions.length > 0 ? (
        <EmptyState
          type="search"
          message="Não encontramos transações com os filtros aplicados. Tente ajustar os filtros ou limpar a busca."
          actionLabel="Limpar todos os filtros"
          onAction={() => {
            setSearchTerm('');
            setFilterType('all');
            setFilterMonth('all');
            setFilterPeriod('all');
            setMinValue('');
            setMaxValue('');
            setShowAdvancedFilters(false);
          }}
        />
      ) : filteredTransactions.length === 0 ? null : (
        <>
          {/* Mobile View - Cards */}
          <div className="sm:hidden space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateShort(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-base font-bold ${
                        transaction.type === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'entrada' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                        transaction.type === 'entrada'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Tooltip content="Editar esta transação" position="top">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="flex-1 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-2 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                      aria-label="Editar transação"
                    >
                      <HiPencil className="w-4 h-4" />
                      Editar
                    </button>
                  </Tooltip>
                  <Tooltip content="Excluir esta transação" position="top">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="flex-1 text-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium py-2 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                      aria-label="Excluir transação"
                    >
                      <HiTrash className="w-4 h-4" />
                      Excluir
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div ref={tableScrollRef} className="hidden sm:block overflow-x-auto relative">
            <ScrollIndicator containerRef={tableScrollRef} />
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-600">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{transaction.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'entrada'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
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
                      <div className="flex items-center justify-center gap-2">
                    <Tooltip content="Editar transação" position="top">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors px-2 py-1 rounded hover:bg-blue-50 flex items-center justify-center gap-1"
                        aria-label="Editar transação"
                      >
                        <HiPencil className="w-4 h-4" />
                        <span className="hidden lg:inline">Editar</span>
                      </button>
                    </Tooltip>
                    <Tooltip content="Excluir transação" position="top">
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors px-2 py-1 rounded hover:bg-red-50 flex items-center justify-center gap-1"
                        aria-label="Excluir transação"
                      >
                        <HiTrash className="w-4 h-4" />
                        <span className="hidden lg:inline">Excluir</span>
                      </button>
                    </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
              Mostrando {filteredTransactions.length} de {transactions.length} transações
            </p>
          </div>
        </>
      )}

      {/* Modal de Edição */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => {
            onDelete(); // Recarregar dados
          }}
        />
      )}
    </div>
  );
};