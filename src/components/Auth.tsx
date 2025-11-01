import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiCheckCircle } from 'react-icons/hi';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setEmailSent(false);

      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success('Login realizado com sucesso!');
      } else {
        // Signup - Configurar URL de redirecionamento
        const redirectTo = window.location.origin;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });

        if (error) throw error;

        setEmailSent(true);
        toast.success('Email de confirmação enviado! Verifique sua caixa de entrada.', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao autenticar');
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  // Tela de confirmação após envio de email
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <HiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Email Enviado! 📧
          </h1>
          <p className="text-gray-600 mb-2">
            Enviamos um email de confirmação para:
          </p>
          <p className="text-blue-600 font-semibold mb-6">{email}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Próximos passos:</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Verifique sua caixa de entrada (e spam)</li>
              <li>Clique no link de confirmação no email</li>
              <li>Volte aqui e faça login</li>
            </ol>
          </div>
          <button
            onClick={() => {
              setEmailSent(false);
              setIsLogin(true);
              setEmail('');
              setPassword('');
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <HiUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Bem-vindo de volta!' : 'Criar Conta'}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? 'Faça login para acessar sua gestão financeira'
              : 'Crie sua conta e comece a gerenciar suas finanças'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <HiMail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            {!isLogin && (
              <p className="mt-2 text-xs text-gray-500">
                Mínimo de 6 caracteres
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
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
                {isLogin ? 'Entrando...' : 'Criando conta...'}
              </span>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setEmailSent(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isLogin ? (
                <>Não tem uma conta? <span className="underline">Crie uma aqui</span></>
              ) : (
                <>Já tem uma conta? <span className="underline">Faça login</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};