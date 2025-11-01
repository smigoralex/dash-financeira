import { useState } from 'react';
import { TransactionType, TransactionInput } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';
import { HiPlus, HiMinus, HiCalendar, HiDocumentText, HiCurrencyDollar, HiX } from 'react-icons/hi';

interface TransactionFormProps {
  onSuccess: () => void;
}

export const TransactionForm = ({ onSuccess }: TransactionFormProps) => {
  const [formData, setFormData] = useState<TransactionInput>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'entrada',
  });
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('A descrição é obrigatória');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('O valor deve ser maior que zero');
      return;
    }

    try {
      setLoading(true);
      await transactionService.create(formData);
      toast.success('Transação adicionada com sucesso!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        type: 'entrada',
      });
      setIsExpanded(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar transação');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      {/* Header - Sempre visível */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  formData.type === 'entrada'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {formData.type === 'entrada' ? (
                  <HiPlus className="w-5 h-5" />
                ) : (
                  <HiMinus className="w-5 h-5" />
                )}
              </div>
          <div className="text-left">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Nova Transação</h2>
            <p className="text-xs sm:text-sm text-gray-500">Clique para expandir</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Form - Expansível */}
      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo e Data - Linha única no desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tipo de Transação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'entrada' })}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.type === 'entrada'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HiPlus className="w-5 h-5" />
                      Receita
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'saida' })}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.type === 'saida'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <HiMinus className="w-5 h-5" />
                      Despesa
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                >
                  <HiCalendar className="w-4 h-4" />
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="description"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
              >
                <HiDocumentText className="w-4 h-4" />
                Descrição
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Ex: Salário, Conta de luz, Supermercado..."
                required
              />
            </div>

            {/* Valor */}
            <div>
              <label
                htmlFor="amount"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
              >
                <HiCurrencyDollar className="w-4 h-4" />
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {formData.amount > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Valor formatado: <span className="font-semibold">{formatCurrency(formData.amount)}</span>
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  formData.type === 'entrada'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  formData.type === 'entrada'
                    ? 'focus:ring-green-500'
                    : 'focus:ring-red-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  'Adicionar Transação'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: 0,
                    type: 'entrada',
                  });
                }}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <HiX className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};