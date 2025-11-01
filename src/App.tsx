import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { HiRefresh, HiLogout } from 'react-icons/hi';
import { Auth } from './components/Auth';
import { ResetPassword } from './components/ResetPassword';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useMonthlyBalances } from './hooks/useMonthlyBalances';
import { useTotalBalance } from './hooks/useTotalBalance';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { transactions, loading, refetch: refetchTransactions } = useTransactions();
  const { refetch: refetchBalances } = useMonthlyBalances();
  const { refetch: refetchTotal } = useTotalBalance();
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Verificar se há token de reset password na URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setShowResetPassword(true);
      // Limpar a URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleRefresh = () => {
    refetchTransactions();
    refetchBalances();
    refetchTotal();
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
  };

  const handleResetPasswordSuccess = async () => {
    // Fazer logout e limpar estado
    await supabase.auth.signOut();
    setShowResetPassword(false);
    // Limpar URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Mostrar tela de login se não estiver autenticado
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar página de reset de senha se houver token na URL
  if (showResetPassword && !user) {
    return <ResetPassword onSuccess={handleResetPasswordSuccess} />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
                💰 Gestão Financeira
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Controle suas receitas e despesas de forma simples
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500">Logado como</p>
                <p className="text-sm font-medium text-gray-700">{user.email}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Atualizar dados"
              >
                <HiRefresh className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 sm:p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Sair"
              >
                <HiLogout className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Formulário primeiro (mais próximo ao início) */}
        <TransactionForm onSuccess={handleRefresh} />

        {/* Dashboard com gráficos e saldos */}
        <Dashboard />

        {/* Tabela de transações */}
        <TransactionTable
          transactions={transactions}
          onDelete={handleRefresh}
          loading={loading}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 max-w-7xl text-center text-sm text-gray-600">
          <p>Gestão Financeira - Desenvolvido com React, TypeScript e Supabase</p>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;