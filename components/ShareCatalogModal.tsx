
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  ExternalLink,
  Smartphone,
  Globe,
  Layout,
  Star,
  ShoppingBag,
  MessageSquare,
  Link as LinkIcon
} from 'lucide-react';
import { Catalog, MessageTemplate } from '../types';

const catalogTemplates: (MessageTemplate & { icon: React.ReactNode, label: string })[] = [
  {
    id: 'cat-welcome',
    name: 'Boas-vindas',
    label: 'Geral e amigável',
    content: 'Olá! Confira nosso catálogo virtual atualizado: *{name}* 🚀\n\nPreparamos uma seleção incrível de produtos para você. Veja tudo aqui:\n{link}',
    icon: <Globe size={14} />
  },
  {
    id: 'cat-promo',
    name: 'Vitrine de Ofertas',
    label: 'Foco em vendas',
    content: '🛍️ *OPORTUNIDADE!* 🛍️\n\nAcesse nossa vitrine digital e confira as melhores ofertas do catálogo *{name}*.\n\nClique no link para garantir os seus itens favoritos:\n{link}',
    icon: <ShoppingBag size={14} />
  },
  {
    id: 'cat-exclusive',
    name: 'Seleção Exclusiva',
    label: 'Para clientes VIP',
    content: '✨ *CONVITE ESPECIAL* ✨\n\nGostaria de compartilhar com você nossa nova coleção: *{name}*.\n\nProdutos selecionados a dedo para nossos melhores clientes. Confira:\n{link}',
    icon: <Star size={14} />
  }
];

interface ShareCatalogModalProps {
  catalog: Catalog;
  onClose: () => void;
}

const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({ catalog, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(catalogTemplates[0].id);
  const [customMessage, setCustomMessage] = useState(catalogTemplates[0].content);
  
  const catalogUrl = window.location.origin + `/c/${catalog.id}`;

  useEffect(() => {
    const template = catalogTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      setCustomMessage(template.content);
    }
  }, [selectedTemplateId]);

  const getProcessedMessage = () => {
    return customMessage
      .replace(/{name}/g, catalog.name)
      .replace(/{link}/g, catalogUrl);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getProcessedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(getProcessedMessage());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <Share2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Compartilhar Catálogo</h3>
              <p className="text-xs text-indigo-100 font-bold">Personalize sua abordagem de venda</p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna da Esquerda: Seleção de Estilo */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                  <Layout size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estilos Disponíveis</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {catalogTemplates.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`flex items-center gap-3 text-left p-4 rounded-2xl transition-all border-2 ${
                      selectedTemplateId === t.id 
                        ? 'bg-white border-indigo-500 shadow-md ring-4 ring-indigo-50' 
                        : 'bg-white border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTemplateId === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {t.icon}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${selectedTemplateId === t.id ? 'text-indigo-700' : 'text-slate-700'}`}>{t.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                  <LinkIcon size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link do Catálogo</span>
              </div>
              <div className="flex items-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl">
                <input 
                  readOnly
                  type="text" 
                  value={catalogUrl}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-400 overflow-hidden text-ellipsis"
                />
                <button 
                  onClick={() => window.open(catalogUrl, '_blank')}
                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Editor de Mensagem */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <MessageSquare size={14} /> Editar Mensagem de Envio
              </label>
              <textarea 
                rows={10}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full flex-1 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none font-medium text-slate-700"
                placeholder="Escreva sua mensagem aqui..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{name}', '{link}'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-400 rounded-md text-[9px] font-black uppercase border border-indigo-100">{tag}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleCopy}
                className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                {copied ? 'Copiado' : 'Copiar Texto'}
              </button>
              <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 group active:scale-95"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCatalogModal;
