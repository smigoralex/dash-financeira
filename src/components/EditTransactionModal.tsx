import { useState, useEffect } from 'react';
import { Transaction, TransactionInput } from '../types/transaction';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';
import { HiX, HiCalendar, HiDocumentText, HiCurrencyDollar, HiPlus, HiMinus } from 'react-icons/hi';

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTransactionModal = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}: EditTransactionModalProps) => {
  const [formData, setFormData] = useState<TransactionInput>({
    date: transaction.date,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; amount?: string }>({});

  useEffect(() => {
    if (isOpen && transaction) {
      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
      });
      setErrors({});
    }
  }, [isOpen, transaction]);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors: { description?: string; amount?: string } = {};

    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'O valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await transactionService.update(transaction.id, formData);
      toast.success('Transação atualizada com sucesso! ✨');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar transação');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Editar Transação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <HiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Transação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'entrada' })}
                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.type === 'entrada'
                    ? 'bg-green-50 border-green-500 text-green-700 shadow-md'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-500'
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
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-md'
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

          {/* Data */}
          <div>
            <label
              htmlFor="edit-date"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <HiCalendar className="w-4 h-4" />
              Data
            </label>
            <input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="edit-description"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <HiDocumentText className="w-4 h-4" />
              Descrição
            </label>
              <input
                id="edit-description"
                type="text"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Ex: Salário, Conta de luz..."
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {errors.description}
                </p>
              )}
          </div>

          {/* Valor */}
          <div>
            <label
              htmlFor="edit-amount"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <HiCurrencyDollar className="w-4 h-4" />
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 dark:text-gray-400 font-medium">R$</span>
                  <input
                    id="edit-amount"
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                      if (errors.amount) setErrors({ ...errors, amount: undefined });
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      errors.amount
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span> {errors.amount}
                  </p>
                )}
              </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
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
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
