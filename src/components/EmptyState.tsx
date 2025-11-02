import { HiDocumentText, HiCurrencyDollar, HiTrendingUp, HiSparkles } from 'react-icons/hi';

interface EmptyStateProps {
  type: 'transactions' | 'dashboard' | 'search';
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ type, message, actionLabel, onAction }: EmptyStateProps) => {
  const getContent = () => {
    switch (type) {
      case 'transactions':
        return {
          icon: <HiDocumentText className="w-16 h-16 text-blue-400" />,
          title: 'Nenhuma transação ainda',
          description: message || 'Comece registrando suas receitas e despesas para ter um controle completo das suas finanças.',
          actionLabel: actionLabel || 'Adicionar primeira transação',
          emoji: '📊',
        };
      case 'dashboard':
        return {
          icon: <HiTrendingUp className="w-16 h-16 text-purple-400" />,
          title: 'Seus dados aparecerão aqui',
          description: message || 'Após adicionar algumas transações, você verá gráficos e estatísticas aqui.',
          actionLabel: actionLabel || 'Adicionar transação',
          emoji: '📈',
        };
      case 'search':
        return {
          icon: <HiSparkles className="w-16 h-16 text-yellow-400" />,
          title: 'Nenhum resultado encontrado',
          description: message || 'Tente ajustar os filtros de busca para encontrar o que procura.',
          actionLabel: actionLabel || 'Limpar filtros',
          emoji: '🔍',
        };
      default:
        return {
          icon: <HiCurrencyDollar className="w-16 h-16 text-gray-400" />,
          title: 'Nada por aqui',
          description: message || 'Adicione conteúdo para começar.',
          actionLabel: actionLabel || 'Começar',
          emoji: '✨',
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-6">
        {/* Emoji decorativo */}
        <div className="absolute -top-2 -right-2 text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
          {content.emoji}
        </div>
        {/* Ícone principal */}
        <div className="relative z-10 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full transition-colors">
          {content.icon}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 text-center transition-colors">
        {content.title}
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base text-center max-w-md mb-6 transition-colors">
        {content.description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <HiCurrencyDollar className="w-5 h-5" />
          {content.actionLabel}
        </button>
      )}
      
      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};
