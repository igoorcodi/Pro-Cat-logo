
import React, { useState } from 'react';
import { AppView, User } from './types';
import { Package, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from './supabase';

interface AuthProps {
  view: AppView;
  setView: (view: AppView) => void;
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ view, setView, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Garante que o erro retornado pelo Supabase seja uma string legível
  const formatError = (err: any): string => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    const msg = err.message || err.error_description || err.details || err.msg;
    if (msg && typeof msg === 'string') return msg;
    try {
      const stringified = JSON.stringify(err);
      return stringified === '{}' ? String(err) : stringified;
    } catch (e) {
      return String(err);
    }
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
        const { error: registerError } = await supabase.rpc('register_user_secure', {
          name_in: name.trim(),
          email_in: cleanEmail,
          pass_in: password
        });

        if (registerError) {
          const msg = formatError(registerError);
          if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
            setErrorMessage('Este e-mail já está sendo utilizado por outra conta.');
          } else {
            setErrorMessage(msg);
          }
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Conta criada com sucesso! Redirecionando para o login...');
        setTimeout(() => setView('login'), 2000);
        
      } else {
        const { data, error: loginError } = await supabase.rpc('login_user', {
          email_input: cleanEmail,
          password_input: password
        });

        if (loginError) {
          setErrorMessage('Erro na autenticação. Verifique seu e-mail e senha.');
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
          setErrorMessage('Esta conta está temporariamente desativada.');
          setIsLoading(false);
          return;
        }

        onLogin(userData as User);
      }
    } catch (err: any) {
      setErrorMessage('Erro ao conectar com o servidor. Tente novamente mais tarde.');
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
        <p className="text-black max-w-md mb-12 text-lg font-medium">Sua vitrine profissional pronta para vender mais no WhatsApp.</p>
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
        >
          Acessar Painel <ArrowRight size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Package size={32} />
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight">{view === 'login' ? 'Bom te ver de novo!' : 'Crie sua conta grátis'}</h2>
          <p className="mt-2 text-slate-500 font-bold">Acesso seguro ao seu sistema de gestão.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in shake duration-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <span className="text-xs font-bold whitespace-pre-wrap">{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in zoom-in duration-300">
                <CheckCircle2 size={20} />
                <span className="text-xs font-bold">{successMessage}</span>
              </div>
            )}

            {view === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Seu Nome</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="João Silva" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-bold text-black" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-bold text-black" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none transition-all font-bold text-black" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-70">
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : (
                <> {view === 'login' ? 'Acessar Sistema' : 'Criar Minha Conta'} <ArrowRight size={20} /> </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 font-bold">
          {view === 'login' ? (
            <>Ainda não tem conta? <button onClick={() => setView('register')} className="text-indigo-600 font-black hover:underline">Cadastre-se grátis</button></>
          ) : (
            <>Já possui uma conta? <button onClick={() => setView('login')} className="text-indigo-600 font-black hover:underline">Fazer Login</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
