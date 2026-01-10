
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
  Info,
  Phone,
  ImageOff
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
    
    // Fallback para link do produto se não houver um sistema de rotas públicas pronto
    const productLink = `${window.location.origin}/?p=${product.id}`;
    
    return customMessage
      .replace(/{name}/g, product.name)
      .replace(/{price}/g, priceCurrent)
      .replace(/{price_old}/g, priceOld)
      .replace(/{sku}/g, product.sku || 'N/A')
      .replace(/{category}/g, product.category || 'Geral')
      .replace(/{link}/g, productLink);
  };

  const handleSend = () => {
    const text = encodeURIComponent(getProcessedMessage());
    const cleanPhone = phone.replace(/\D/g, '');
    
    // No mobile, wa.me é mais resiliente que api.whatsapp
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getProcessedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header fixo */}
        <div className="p-4 sm:p-6 bg-emerald-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Enviar Produto</h3>
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">WhatsApp Marketing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <X className="w-6 h-6 sm:w-7 h-7" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          
          {/* Grid responsivo: Coluna única no mobile, 2 colunas no desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Lado Esquerdo: Produto e Estilos */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm bg-slate-100 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff size={24} className="text-slate-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{product.name}</p>
                  <p className="text-emerald-600 font-black text-base mt-0.5">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-0.5 rounded-md mt-1 inline-block">SKU: {product.sku || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selecione o Estilo da Mensagem</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {productTemplates.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`flex items-center gap-3 text-left p-3.5 rounded-2xl transition-all border-2 ${
                        selectedTemplateId === t.id 
                          ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-500/10' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${selectedTemplateId === t.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {t.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[11px] font-black uppercase tracking-tight ${selectedTemplateId === t.id ? 'text-emerald-700' : 'text-slate-700'}`}>{t.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{t.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lado Direito: Edição e Telefone */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <MessageSquare size={14} className="text-emerald-500" /> Editar Mensagem
                </label>
                <textarea 
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all resize-none text-slate-700"
                  placeholder="Personalize sua mensagem aqui..."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['{name}', '{price}', '{link}'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded text-[8px] font-black uppercase">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp do Cliente (Opcional)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <Phone size={16} className="text-emerald-500" />
                    <span className="text-slate-400 font-black text-xs border-r border-slate-200 pr-2">+55</span>
                  </div>
                  <input 
                    type="tel" 
                    inputMode="numeric"
                    placeholder="11 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-20 pr-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all group-hover:border-slate-200"
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-medium px-1">Dica: Se deixar em branco, o WhatsApp abrirá sua lista de contatos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé fixo */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 shrink-0">
          <button 
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            {copied ? 'Copiado para o Clip' : 'Copiar Texto'}
          </button>
          <button 
            onClick={handleSend}
            className="flex-[1.5] flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-200 active:scale-95"
          >
            <Send size={20} />
            Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
