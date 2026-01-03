
import React, { useState } from 'react';
import { AppView, User } from '../types';
import { Package, Mail, Lock, User as UserIcon, ArrowRight, Github } from 'lucide-react';

interface AuthProps {
  view: AppView;
  setView: (view: AppView) => void;
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ view, setView, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Fake auth delay
    // Added missing status and permissions properties to satisfy User type
    setTimeout(() => {
      onLogin({
        id: '1',
        name: email.split('@')[0].toUpperCase(),
        email: email,
        role: 'admin',
        status: 'active',
        permissions: {
          dashboard: 'admin',
          products: 'admin',
          categories: 'admin',
          catalogs: 'admin',
          reports: 'admin',
          settings: 'admin'
        }
      });
      setIsLoading(false);
    }, 1500);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-200">
            <Package size={32} />
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight">
            {view === 'login' ? 'Bom te ver de novo!' : 'Crie sua conta grátis'}
          </h2>
          <p className="mt-2 text-black font-bold">Acesse a melhor plataforma de catálogos digitais.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-black uppercase tracking-widest px-1">Seu Nome</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    required
                    type="text" 
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
                  placeholder="exemplo@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-black uppercase tracking-widest">Senha</label>
                {view === 'login' && <button type="button" className="text-xs font-black text-indigo-600 hover:underline">Esqueceu?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-black"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-black font-black tracking-widest">OU</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-black hover:bg-slate-50 transition-all">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-black hover:bg-slate-50 transition-all">
              <Github size={18} className="text-black" />
              GitHub
            </button>
          </div>
        </div>

        <p className="text-center text-black font-bold">
          {view === 'login' ? (
            <>Não tem uma conta? <button onClick={() => setView('register')} className="text-indigo-600 font-black hover:underline">Cadastre-se</button></>
          ) : (
            <>Já tem uma conta? <button onClick={() => setView('login')} className="text-indigo-600 font-black hover:underline">Entre agora</button></>
          )}
        </p>
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
