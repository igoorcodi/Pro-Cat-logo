
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Smartphone, 
  Copy, 
  Check, 
  MessageSquare,
  Layout,
  Sparkles,
  Zap,
  Tag,
  Info
} from 'lucide-react';
import { Product, MessageTemplate } from '../types';

const productTemplates: (MessageTemplate & { icon: React.ReactNode, label: string })[] = [
  {
    id: 'standard',
    name: 'Padrão Profissional',
    label: 'Direto e claro',
    icon: <Layout size={14} />,
    content: 'Olá! Veja este produto que separei para você: *{name}*. Por apenas *R$ {price}*. Confira os detalhes no link: {link}'
  },
  {
    id: 'promo',
    name: 'Oferta Especial',
    label: 'Foco em desconto',
    icon: <Zap size={14} />,
    content: '🔥 *OFERTA LIMITADA!* 🔥\n\nConfira este item: *{name}*\nDe ~R$ {price_old}~ por apenas *R$ {price}*.\n\nGaranta o seu antes que acabe: {link}'
  },
  {
    id: 'new',
    name: 'Lançamento',
    label: 'Novidade',
    icon: <Sparkles size={14} />,
    content: '✨ *NOVIDADE NA LOJA!* ✨\n\nAcabamos de receber: *{name}*.\nDesign exclusivo e estoque limitado!\n\nPreço: *R$ {price}*\n\nVeja todas as fotos aqui: {link}'
  },
  {
    id: 'technical',
    name: 'Detalhado',
    label: 'Com SKU e Ref',
    icon: <Info size={14} />,
    content: 'Olá! Seguem as informações do produto solicitado:\n\n📦 *{name}*\nRef (SKU): {sku}\nCategoria: {category}\n\nValor: *R$ {price}*\n\nLink da vitrine: {link}'
  }
];

interface WhatsAppModalProps {
  product: Product;
  onClose: () => void;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ product, onClose }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(productTemplates[0].id);
  const [phone, setPhone] = useState('');
  const [customMessage, setCustomMessage] = useState(productTemplates[0].content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const template = productTemplates.find(t => t.id === selectedTemplateId);
    if (template) {
      setCustomMessage(template.content);
    }
  }, [selectedTemplateId]);

  const getProcessedMessage = () => {
    const priceOld = (product.price * 1.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const priceCurrent = product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    return customMessage
      .replace(/{name}/g, product.name)
      .replace(/{price}/g, priceCurrent)
      .replace(/{price_old}/g, priceOld)
      .replace(/{sku}/g, product.sku || 'N/A')
      .replace(/{category}/g, product.category || 'Geral')
      .replace(/{link}/g, window.location.origin + `/p/${product.id}`);
  };

  const handleSend = () => {
    const text = encodeURIComponent(getProcessedMessage());
    const cleanPhone = phone.replace(/\D/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getProcessedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Enviar Produto</h3>
              <p className="text-xs text-emerald-100 font-bold">WhatsApp Marketing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna da Esquerda: Seleção e Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner">
              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
                <p className="font-black text-slate-800 text-sm truncate">{product.name}</p>
                <p className="text-emerald-600 font-black text-xs">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selecione o Estilo</label>
              <div className="grid grid-cols-1 gap-2">
                {productTemplates.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`flex items-center gap-3 text-left p-3 rounded-2xl transition-all border-2 ${
                      selectedTemplateId === t.id 
                        ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTemplateId === t.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {t.icon}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-tight ${selectedTemplateId === t.id ? 'text-emerald-700' : 'text-slate-700'}`}>{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{t.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Edição e Envio */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <MessageSquare size={14} /> Personalizar Mensagem
              </label>
              <textarea 
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full flex-1 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-emerald-50 outline-none transition-all resize-none font-medium text-slate-700"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {['{name}', '{price}', '{price_old}', '{link}'].map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-400 rounded-md text-[9px] font-black uppercase">{tag}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp do Cliente (Opcional)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+55</div>
                <input 
                  type="text" 
                  placeholder="11 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-50 outline-none font-black transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button 
                onClick={handleSend}
                className="flex-[1.5] flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 active:scale-95"
              >
                <Send size={20} />
                Enviar agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
