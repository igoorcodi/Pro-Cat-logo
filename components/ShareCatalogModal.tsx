
import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink,
  Smartphone,
  Globe
} from 'lucide-react';
import { Catalog } from '../types';

interface ShareCatalogModalProps {
  catalog: Catalog;
  onClose: () => void;
}

const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({ catalog, onClose }) => {
  const [copied, setCopied] = useState(false);
  const catalogUrl = `https://catalogo.pro/c/${catalog.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Confira nosso catálogo virtual: *${catalog.name}* 🚀\n\nVeja todos os nossos produtos aqui:\n${catalogUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
              <Share2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Compartilhar</h3>
              <p className="text-xs text-indigo-100 font-bold">Link da Vitrine Virtual</p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Globe size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link Público</span>
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl">
              <input 
                readOnly
                type="text" 
                value={catalogUrl}
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-600 overflow-hidden text-ellipsis"
              />
              <button 
                onClick={handleCopy}
                className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-100 group"
            >
              <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
              WhatsApp
            </button>
            <button 
              onClick={() => window.open(catalogUrl, '_blank')}
              className="flex items-center justify-center gap-3 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 group"
            >
              <ExternalLink size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Ver Vitrine
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              O catálogo <span className="text-indigo-600">{catalog.name}</span> está pronto para ser enviado aos seus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCatalogModal;
