
import React, { useState } from 'react';
import { AppView, User } from '../types';
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

  const formatError = (err: any): string => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    if (err.details) return err.details;
    return 'Erro desconhecido no servidor.';
  };

  const handleSwitchView = (newView: AppView) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsForgotPassword(false);
    setView(newView);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (view === 'register') {
        const { data, error: registerError } = await supabase.rpc('register_user_secure', {
          name_in: name.trim(),
          email_in: cleanEmail,
          pass_in: password
        });

        if (registerError) {
          const msg = formatError(registerError);
          setErrorMessage(msg.includes('unique') ? 'Este e-mail já está cadastrado.' : msg);
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Conta criada! Agora você pode entrar.');
        setTimeout(() => setView('login'), 2000);
        
      } else {
        // LOGIN
        console.log('Tentando login para:', cleanEmail);
        
        const { data, error: loginError } = await supabase.rpc('login_user', {
          email_input: cleanEmail,
          password_input: password
        });

        if (loginError) {
          console.error('Erro RPC login_user:', loginError);
          setErrorMessage('Falha na comunicação com o banco de dados.');
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
          setErrorMessage('Sua conta está desativada.');
          setIsLoading(false);
          return;
        }

        // Sucesso
        onLogin(userData as User);
      }
    } catch (err: any) {
      console.error('Exceção no Auth:', err);
      setErrorMessage('Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Resto do componente permanece igual, mas com os novos estilos aplicados acima)
  
  if (view === 'onboarding') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-200 animate-bounce">
          <Package size={48} />
        </div>
        <h1 className="text-4xl font-black text-black mb-4">Bem-vindo ao Catálogo Pro! 🚀</h1>
        <p className="text-black max-w-md mb-12 text-lg font-medium">O próximo passo para elevar o nível da sua gestão de inventário e vendas no WhatsApp.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:shadow-lg transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">📦</div>
            <h3 className="font-black text-black mb-2">Organize</h3>
            <p className="text-xs text-black leading-relaxed font-bold">Gestão total de produtos e estoques em um só lugar.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:shadow-lg transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">📱</div>
            <h3 className="font-black text-black mb-2">Compartilhe</h3>
            <p className="text-xs text-black leading-relaxed font-bold">Envie produtos diretamente no WhatsApp com um clique.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:shadow-lg transition-all group">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">📊</div>
            <h3 className="font-black text-black mb-2">Analise</h3>
            <p className="text-xs text-black leading-relaxed font-bold">Acompanhe o que seus clientes mais procuram.</p>
          </div>
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
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="João Silva" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-black uppercase tracking-widest px-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Senha</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                <>
                  {view === 'login' ? 'Acessar Sistema' : 'Criar Conta'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-black font-bold">
          {view === 'login' ? (
            <>Novo por aqui? <button onClick={() => handleSwitchView('register')} className="text-indigo-600 font-black hover:underline">Cadastre-se</button></>
          ) : (
            <>Já é cadastrado? <button onClick={() => handleSwitchView('login')} className="text-indigo-600 font-black hover:underline">Entrar</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
