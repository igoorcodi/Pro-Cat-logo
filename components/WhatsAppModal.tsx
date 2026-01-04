
import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Smartphone, 
  Copy, 
  Check, 
  MessageSquare,
  Layout
} from 'lucide-react';
import { Product, MessageTemplate } from '../types';

const mockTemplates: MessageTemplate[] = [];

interface WhatsAppModalProps {
  product: Product;
  onClose: () => void;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ product, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [phone, setPhone] = useState('');
  const [customMessage, setCustomMessage] = useState('Olá! Veja este produto: *{name}*. Por apenas *R$ {price}*. Confira os detalhes: {link}');
  const [copied, setCopied] = useState(false);

  const getProcessedMessage = () => {
    return customMessage
      .replace('{name}', product.name)
      .replace('{price}', product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
      .replace('{price_old}', (product.price * 1.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
      .replace('{link}', `https://catalogo.pro/p/${product.id}`);
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
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Smartphone size={24} />
            <h3 className="text-xl font-bold">Compartilhar via WhatsApp</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layout size={14} /> Templates
              </label>
              <div className="space-y-2">
                {mockTemplates.length > 0 ? (
                  mockTemplates.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplate(t);
                        setCustomMessage(t.content);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedTemplate?.id === t.id 
                          ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500' 
                          : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-[10px] text-slate-400 font-bold uppercase text-center border-2 border-dashed border-slate-200">
                    Nenhum template salvo
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14} /> Mensagem Personalizada
              </label>
              <textarea 
                rows={6}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none font-medium"
              />
              <p className="text-[10px] text-slate-400 italic">Dica: Use {'{name}'}, {'{price}'} e {'{link}'} para auto-preencher.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Número do Destinatário (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ex: 55 11 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold transition-all"
              >
                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button 
                onClick={handleSend}
                className="flex-[1.5] flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100"
              >
                <Send size={20} />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
