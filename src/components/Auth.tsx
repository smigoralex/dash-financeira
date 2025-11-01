import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiCheckCircle, HiArrowLeft, HiXCircle } from 'react-icons/hi';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Preencha todos os campos');
      toast.error('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          let errorMsg = 'Erro ao fazer login';
          
          // Mensagens específicas para diferentes tipos de erro
          console.log('Erro completo do login:', error);
          
          if (error.message.includes('Invalid login credentials') || 
              error.message.includes('Invalid') || 
              error.message.includes('incorrect')) {
            errorMsg = '❌ Senha incorreta ou email não encontrado. Verifique suas credenciais.';
          } else if (error.message.includes('Email not confirmed') || 
                     error.message.includes('email_not_confirmed') ||
                     error.message.includes('not confirmed')) {
            errorMsg = '⚠️ Email não confirmado! Verifique sua caixa de entrada (e spam) e clique no link de confirmação que enviamos.';
          } else {
            errorMsg = `Erro: ${error.message}`;
          }
          
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          console.error('Erro no login:', error);
          throw error;
        }

        // Verificar se o usuário foi autenticado
        if (data?.user) {
          setSuccessMessage('Login realizado com sucesso!');
          toast.success('Login realizado com sucesso! 🎉', {
            duration: 3000,
            icon: '✅',
          });
        }
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

        if (error) {
          let errorMsg = 'Erro ao criar conta';
          
          if (error.message.includes('already registered')) {
            errorMsg = 'Este email já está cadastrado. Tente fazer login.';
          } else {
            errorMsg = error.message || 'Erro ao criar conta';
          }
          
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          throw error;
        }

        setEmailSent(true);
        setSuccessMessage('Conta criada com sucesso! Confirme no email que você recebeu.');
        toast.success('Email de confirmação enviado! Verifique sua caixa de entrada.', {
          duration: 5000,
        });
      }
    } catch (error: any) {
      // Erro já tratado acima
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Digite seu email para recuperar a senha');
      toast.error('Digite seu email para recuperar a senha');
      return;
    }

    try {
      setLoading(true);
      const redirectTo = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectTo}/reset-password`,
      });

      if (error) {
        let errorMsg = 'Erro ao enviar email de recuperação';
        
        if (error.message.includes('not found')) {
          errorMsg = 'Email não encontrado. Verifique se digitou corretamente.';
        } else {
          errorMsg = error.message || 'Erro ao enviar email de recuperação';
        }
        
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.', {
        duration: 5000,
      });
      setShowResetPassword(false);
      setEmail('');
    } catch (error: any) {
      toast.error('Erro ao enviar email de recuperação');
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
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  // Tela de reset de senha
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => {
              setShowResetPassword(false);
              setEmail('');
              setErrorMessage(null);
            }}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar para login</span>
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <HiLockClosed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Recuperar Senha
            </h1>
            <p className="text-gray-600">
              Digite seu email e enviaremos um link para redefinir sua senha
            </p>
          </div>

          {/* Mensagem de erro */}
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <HiXCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <HiMail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

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
                  Enviando...
                </span>
              ) : (
                'Enviar Email de Recuperação'
              )}
            </button>
          </form>
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

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Mensagem de erro */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <HiXCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(true);
                    setPassword('');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
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
                setErrorMessage(null);
                setSuccessMessage(null);
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