
import React, { useState } from 'react';
import { AppView, User } from '../types';
// Fixed: Added Loader2 to lucide-react imports
import { Package, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, ChevronLeft, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

interface AuthProps {
  view: AppView;
  setView: (view: AppView) => void;
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ view, setView, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSwitchView = (newView: AppView) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsForgotPassword(false);
    setView(newView);
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/?type=recovery`,
      });

      if (error) {
        setErrorMessage(error.message || 'Erro ao enviar e-mail de recuperação.');
      } else {
        setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
        setEmail('');
      }
    } catch (err) {
      setErrorMessage('Erro ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message || 'Erro ao atualizar senha.');
      } else {
        setSuccessMessage('Senha atualizada com sucesso! Você já pode entrar.');
        setTimeout(() => {
          setView('login');
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err) {
      setErrorMessage('Erro ao atualizar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      if (view === 'register') {
        const { data: newUser, error: registerError } = await supabase.rpc('register_user_secure', {
             name_in: name.trim(),
             email_in: email.trim(),
             pass_in: password
        });

        if (registerError) {
          setErrorMessage(registerError.message.includes('unique_email') 
            ? 'Este e-mail já está sendo usado.' 
            : 'Erro ao criar conta.');
          setIsLoading(false);
          return;
        }

        if (newUser) {
          setSuccessMessage('Conta criada com sucesso! Você já pode fazer login.');
          setName('');
          setEmail('');
          setPassword('');
          setTimeout(() => {
            setView('login');
            setSuccessMessage('');
          }, 3000);
        }
      } else {
        const { data, error } = await supabase.rpc('login_user', {
          email_input: email.trim(),
          password_input: password
        });

        if (error) {
          setErrorMessage('Erro interno no servidor de autenticação.');
          setIsLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setErrorMessage('E-mail ou senha incorretos.');
          setIsLoading(false);
          return;
        }

        const userData = data[0];
        if (userData.status !== 'active') {
          setErrorMessage('Este usuário está desativado.');
          setIsLoading(false);
          return;
        }

        onLogin(userData as User);
      }
    } catch (err) {
      setErrorMessage('Erro de conexão com o banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-200 animate-bounce">
          <Package size={48} />
        </div>
        <h1 className="text-4xl font-black text-black mb-4">Bem-vindo ao Catálogo Pro! 🚀</h1>
        <p className="text-black max-w-md mb-12 text-lg font-medium">O próximo passo para elevar o nível da sua gestão de inventário e vendas no WhatsApp.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
          <OnboardingCard icon="📦" title="Organize" desc="Gestão total de produtos e estoques em um só lugar." />
          <OnboardingCard icon="📱" title="Compartilhe" desc="Envie produtos diretamente no WhatsApp com um clique." />
          <OnboardingCard icon="📊" title="Analise" desc="Acompanhe o que seus clientes mais procuram." />
        </div>

        <button 
          onClick={() => setView('dashboard')}
          className="group flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
        >
          Começar Agora
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  // View de Redefinição de Senha (quando o usuário clica no link do e-mail)
  if (view === 'reset-password') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="w-full max-w-md space-y-8 relative z-10 animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
              <KeyRound size={32} />
            </div>
            <h2 className="text-3xl font-black text-black tracking-tight">Nova Senha</h2>
            <p className="mt-2 text-black font-bold">Crie uma senha segura para sua conta.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold">{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-bold">{successMessage}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest px-1">Nova Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest px-1">Confirmar Senha</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70">
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Atualizar Senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Package size={32} />
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight">
            {isForgotPassword ? 'Recuperar Senha' : view === 'login' ? 'Bom te ver de novo!' : 'Crie sua conta grátis'}
          </h2>
          <p className="mt-2 text-black font-bold">
            {isForgotPassword ? 'Insira seu e-mail para receber um link.' : 'Acesso seguro à sua vitrine.'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
               {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-bold">{successMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest px-1">E-mail Cadastrado</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Enviar Link de Recuperação'}
              </button>

              <button 
                type="button" 
                onClick={() => setIsForgotPassword(false)}
                className="w-full flex items-center justify-center gap-2 text-slate-400 font-black text-xs uppercase hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={16} /> Voltar para o Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in duration-300">
                  <CheckCircle2 size={20} />
                  <span className="text-sm font-bold">{successMessage}</span>
                </div>
              )}

              {view === 'register' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-black uppercase tracking-widest px-1">Seu Nome</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="João Silva"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest px-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-black uppercase tracking-widest">Senha</label>
                  {view === 'login' && <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-black text-indigo-600 hover:underline">Esqueceu?</button>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || successMessage !== ''}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    {view === 'login' ? 'Acessar Sistema' : 'Criar Conta Segura'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {!isForgotPassword && (
          <p className="text-center text-black font-bold">
            {view === 'login' ? (
              <>Novo por aqui? <button onClick={() => handleSwitchView('register')} className="text-indigo-600 font-black hover:underline">Cadastre-se</button></>
            ) : (
              <>Já é cadastrado? <button onClick={() => handleSwitchView('login')} className="text-indigo-600 font-black hover:underline">Entrar</button></>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

const OnboardingCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:shadow-lg transition-all group">
    <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
    <h3 className="font-black text-black mb-2">{title}</h3>
    <p className="text-xs text-black leading-relaxed font-bold">{desc}</p>
  </div>
);

export default Auth;
