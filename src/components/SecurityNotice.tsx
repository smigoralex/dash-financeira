import { HiShieldCheck, HiX } from 'react-icons/hi';
import { useState } from 'react';

export const SecurityNotice = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Verificar se o usuário já viu o aviso
    return !localStorage.getItem('securityNoticeDismissed');
  });

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 relative animate-slideUp">
      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('securityNoticeDismissed', 'true');
        }}
        className="absolute top-2 right-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        aria-label="Fechar aviso"
      >
        <HiX className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-3 pr-8">
        <HiShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
            🔒 Seus dados estão seguros
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            Esta aplicação utiliza <strong>Supabase</strong> para armazenamento seguro e criptografado. 
            Seus dados financeiros são privados e apenas você tem acesso. Nenhuma informação é compartilhada com terceiros.
          </p>
        </div>
      </div>
    </div>
  );
};

