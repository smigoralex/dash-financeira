import { useMemo } from 'react';
import { useMonthlyBalances } from '../hooks/useMonthlyBalances';
import { useTotalBalance } from '../hooks/useTotalBalance';
import { useTransactions } from '../hooks/useTransactions';
import { useCountUp } from '../hooks/useCountUp';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { LiveIndicator } from './LiveIndicator';
import { EmptyState } from './EmptyState';
import { SkeletonLoader } from './SkeletonLoader';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HiCurrencyDollar, HiCalendar, HiTrendingUp, HiTrendingDown, HiCash, HiCollection } from 'react-icons/hi';

const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

export const Dashboard = () => {
  const { balances, loading: balancesLoading } = useMonthlyBalances();
  const { totalBalance, loading: totalLoading } = useTotalBalance();
  const { transactions } = useTransactions();
  
  // Animações count-up
  const animatedTotalBalance = useCountUp(totalBalance, { duration: 1500, decimals: 2 });
  const animatedTotalEntries = useCountUp(
    useMemo(() => transactions.filter((t) => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0), [transactions]),
    { duration: 1500, decimals: 2 }
  );
  const animatedTotalExpenses = useCountUp(
    useMemo(() => transactions.filter((t) => t.type === 'saida').reduce((sum, t) => sum + t.amount, 0), [transactions]),
    { duration: 1500, decimals: 2 }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonthYear = (monthYear: string) => {
    try {
      const [year, month] = monthYear.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return format(date, "MMM 'yy", { locale: ptBR });
    } catch {
      return monthYear;
    }
  };

  const formatMonthYearFull = (monthYear: string) => {
    try {
      const [year, month] = monthYear.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return monthYear;
    }
  };

  // Obter mês atual
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthBalance = balances.find((b) => b.month === currentMonth);
  const isCurrentMonth = (monthYear: string) => monthYear === currentMonth;

  // Dados para gráficos
  const chartData = balances.slice(0, 6).reverse().map((balance) => ({
    month: formatMonthYear(balance.month),
    entries: balance.entries,
    expenses: balance.expenses,
    balance: balance.entries - balance.expenses,
  }));

  // Dados para gráfico de pizza (total geral) - usando useMemo para recalcular quando transactions mudar
  const totalEntries = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const pieData = [
    { name: 'Receitas', value: totalEntries },
    { name: 'Despesas', value: totalExpenses },
  ];

  // Calcular saldo do mês atual (se não existir, usar 0)
  const monthlyBalance =
    currentMonthBalance
      ? currentMonthBalance.entries - currentMonthBalance.expenses
      : balances.length > 0
      ? balances[0].entries - balances[0].expenses
      : 0;

  // Loading skeleton
  if (totalLoading || balancesLoading) {
    return (
      <div className="mb-6 space-y-6">
        <SkeletonLoader type="card" count={1} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader type="card" count={1} />
          <SkeletonLoader type="card" count={1} />
          <SkeletonLoader type="card" count={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-6">
      {/* Card do Mês Atual - Destacado */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <HiCalendar className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium opacity-90">Mês Atual</h3>
              <p className="text-lg sm:text-xl font-bold capitalize">
                {formatMonthYearFull(currentMonth)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs sm:text-sm opacity-80 mb-1">Entradas</p>
              <p className="text-xl sm:text-2xl font-bold text-green-200">
                {currentMonthBalance
                  ? formatCurrency(currentMonthBalance.entries)
                  : 'R$ 0,00'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-80 mb-1">Saídas</p>
              <p className="text-xl sm:text-2xl font-bold text-red-200">
                {currentMonthBalance
                  ? formatCurrency(currentMonthBalance.expenses)
                  : 'R$ 0,00'}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm opacity-80 mb-1">Saldo do Mês</p>
              <div className="flex items-center gap-2">
                {monthlyBalance >= 0 ? (
                  <HiTrendingUp className="w-5 h-5 text-green-200" />
                ) : (
                  <HiTrendingDown className="w-5 h-5 text-red-200" />
                )}
                <p
                  className={`text-xl sm:text-2xl font-bold ${
                    monthlyBalance >= 0 ? 'text-green-200' : 'text-red-200'
                  }`}
                >
                  {formatCurrency(monthlyBalance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Saldo - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Saldo Total */}
        {(() => {
          // Determinar gradiente baseado no valor
          let gradientClass = '';
          if (animatedTotalBalance < 150) {
            // Vermelho (abaixo de R$ 150)
            gradientClass = 'from-red-500 to-red-600';
          } else if (animatedTotalBalance < 1000) {
            // Verde claro/amarelo (entre R$ 150 e R$ 1000)
            gradientClass = 'from-yellow-400 to-green-500';
          } else {
            // Verde (acima de R$ 1000)
            gradientClass = 'from-green-500 to-emerald-600';
          }

          return (
            <div className={`bg-gradient-to-br ${gradientClass} rounded-xl shadow-lg p-4 sm:p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-medium">Saldo Geral</h3>
                  <LiveIndicator isLive={true} className="hidden sm:inline-flex" />
                </div>
                <HiCurrencyDollar className="w-5 h-5 opacity-80" />
              </div>
              <p
                className={`text-2xl sm:text-3xl font-bold font-mono transition-all duration-300 ${
                  animatedTotalBalance >= 0 ? 'text-green-100' : 'text-red-100'
                }`}
              >
                {formatCurrency(animatedTotalBalance)}
              </p>
            </div>
          );
        })()}

        {/* Saldo do Mês Atual (card menor) */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h3 className="text-sm sm:text-base font-medium">Saldo do Mês</h3>
            <HiCash className="w-5 h-5 opacity-80" />
          </div>
          <p
            className={`text-2xl sm:text-3xl font-bold font-mono transition-all duration-300 ${
              monthlyBalance >= 0 ? 'text-green-100' : 'text-red-100'
            }`}
          >
            {formatCurrency(monthlyBalance)}
          </p>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <HiTrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Receitas</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 font-mono">
            {formatCurrency(animatedTotalEntries)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <HiTrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Despesas</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 font-mono">
            {formatCurrency(animatedTotalExpenses)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <HiCollection className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Transações</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">{transactions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <HiCalendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Meses</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">{balances.length}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Linha - Evolução do Saldo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Evolução do Saldo (6 meses)
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  stroke="currentColor"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-text)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Saldo"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px]">
              <EmptyState
                type="dashboard"
                message="Adicione mais transações para ver gráficos e estatísticas detalhadas."
              />
            </div>
          )}
        </div>

        {/* Gráfico de Pizza - Receitas vs Despesas */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Receitas vs Despesas
          </h3>
          {totalEntries > 0 || totalExpenses > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.name}: ${(props.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-text)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px]">
              <EmptyState
                type="dashboard"
                message="Adicione receitas e despesas para ver a distribuição aqui."
              />
            </div>
          )}
        </div>

        {/* Gráfico de Barras - Entradas vs Saídas Mensais */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 lg:col-span-2 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Entradas vs Saídas por Mês (6 meses)
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  stroke="currentColor"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-text)',
                  }}
                />
                <Legend />
                <Bar dataKey="entries" fill="#10b981" name="Entradas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Saídas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px]">
              <EmptyState
                type="dashboard"
                message="Adicione mais transações para ver gráficos e estatísticas detalhadas."
              />
            </div>
          )}
        </div>
      </div>

      {/* Histórico Mensal - Melhorado */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Histórico Mensal</h3>
        {balances.length === 0 ? (
          <EmptyState
            type="dashboard"
            message="Após adicionar algumas transações, você verá o histórico mensal aqui."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Desktop View - Table */}
              <table className="hidden sm:table w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entradas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saídas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {balances.map((balance) => {
                    const monthlyBalance = balance.entries - balance.expenses;
                    const isCurrent = isCurrentMonth(balance.month);
                    return (
                      <tr
                        key={balance.month}
                        className={`hover:bg-gray-50 transition-colors ${
                          isCurrent ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Atual
                              </span>
                            )}
                            {formatMonthYearFull(balance.month)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          {formatCurrency(balance.entries)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {formatCurrency(balance.expenses)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          <span
                            className={monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}
                          >
                            {formatCurrency(monthlyBalance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile View - Cards */}
              <div className="sm:hidden space-y-3">
                {balances.map((balance) => {
                  const monthlyBalance = balance.entries - balance.expenses;
                  const isCurrent = isCurrentMonth(balance.month);
                  return (
                    <div
                      key={balance.month}
                      className={`rounded-lg p-4 border-2 ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {formatMonthYearFull(balance.month)}
                            </span>
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Atual
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(monthlyBalance)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Entradas: </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(balance.entries)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Saídas: </span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(balance.expenses)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};