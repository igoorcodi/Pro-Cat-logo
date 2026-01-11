
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageSquare, 
  Smartphone, 
  Edit2, 
  Trash2, 
  CheckCircle,
  Clock,
  Play,
  PackageCheck,
  Calendar,
  FileText,
  Tag,
  Printer,
  Package,
  CheckCircle2,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';

interface QuotationListProps {
  quotations: Quotation[];
  onEdit: (quotation: Quotation) => void;
  onDelete: (id: number | string) => void;
}

const QuotationList: React.FC<QuotationListProps> = ({ quotations, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [printQuotation, setPrintQuotation] = useState<Quotation | null>(null);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const qIdStr = String(q.id).toLowerCase();
      const matchesSearch = 
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.clientPhone.includes(searchTerm) ||
        q.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.keyword && q.keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
        qIdStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  const toggleSelect = (id: number | string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuotations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuotations.map(q => q.id));
    }
  };

  const handleSendWhatsApp = (quotation: Quotation) => {
    const itemsList = quotation.items.map(item => {
      const subtotal = (item.price * item.quantity) - item.discount;
      return `• *${item.name}*\n  ${item.quantity}x R$ ${item.price.toLocaleString('pt-BR')} ${item.discount > 0 ? `(-R$ ${item.discount.toLocaleString('pt-BR')})` : ''} = R$ ${subtotal.toLocaleString('pt-BR')}`;
    }).join('\n');

    const statusMap: Record<QuotationStatus, string> = {
      waiting: 'Em espera',
      in_progress: 'Em execução',
      finished: 'Finalizada',
      delivered: 'Entregue'
    };

    const message = encodeURIComponent(
      `Olá, *${quotation.clientName}*!\nAtualização do seu pedido/orçamento:\n\n*Situação:* ${statusMap[quotation.status]}\n\n*Itens:*\n${itemsList}\n\n*Total: R$ ${quotation.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n${quotation.notes ? `*Observações:* ${quotation.notes}\n\n` : ''}Vendedor: ${quotation.sellerName}\nComo podemos prosseguir? 😊`
    );
    
    const phone = quotation.clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handlePrint = (quotation: Quotation) => {
    setPrintQuotation(quotation);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusStyle = (status: QuotationStatus) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <PackageCheck size={14} />, label: 'Entregue' };
      case 'finished': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <CheckCircle size={14} />, label: 'Finalizada' };
      case 'in_progress': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Play size={14} />, label: 'Em execução' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-500', icon: <Clock size={14} />, label: 'Em espera' };
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Elemento Oculto para Impressão */}
      {printQuotation && (
        <div className="print-only fixed inset-0 bg-white z-[9999] p-10 font-sans text-black">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Package size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Pro Catálogo</h1>
                <p className="text-sm font-bold text-slate-500">Gestão Inteligente de Vendas</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black uppercase text-indigo-600">Orçamento / Pedido</h2>
              <p className="text-sm font-bold">Nº {String(printQuotation.id).toUpperCase()}</p>
              <p className="text-xs text-slate-400">Emissão: {new Date(printQuotation.createdAt).toLocaleString('pt-BR')}</p>
              <p className="text-xs text-slate-400">Data Orçamento: {new Date(printQuotation.quotationDate).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Dados do Cliente</p>
              <p className="text-lg font-black text-slate-800">{printQuotation.clientName}</p>
              <p className="text-sm font-bold text-slate-500">{printQuotation.clientPhone}</p>
              {printQuotation.keyword && <p className="mt-2 text-xs font-black text-indigo-500 uppercase">Ref: {printQuotation.keyword}</p>}
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Informações da Venda</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold">Vendedor:</span>
                <span className="text-xs font-black uppercase text-indigo-600">{printQuotation.sellerName}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold">Situação:</span>
                <span className="text-xs font-black uppercase">{printQuotation.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <table className="w-full mb-10 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest rounded-tl-xl">Item</th>
                <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-widest">Qtd</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest">Preço Un.</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest">Desconto</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest rounded-tr-xl">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100">
              {printQuotation.items.map((item, idx) => {
                const subtotal = (item.price * item.quantity) - item.discount;
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-4">
                      <p className="font-black text-slate-800 text-sm">{item.name}</p>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-sm">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-sm">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-4 text-right text-sm text-red-500">- R$ {item.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-4 text-right font-black text-slate-900 text-sm">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-start gap-10">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Observações Gerais</p>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl min-h-[100px] text-xs leading-relaxed text-slate-600 italic">
                {printQuotation.notes || "Nenhuma observação adicional registrada."}
              </div>
            </div>
            <div className="w-64 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] font-black uppercase">Subtotal Bruto:</span>
                <span className="text-sm font-bold">R$ {printQuotation.items.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-red-400">
                <span className="text-[10px] font-black uppercase">Total Descontos:</span>
                <span className="text-sm font-bold">- R$ {printQuotation.items.reduce((a, b) => a + b.discount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="text-sm font-black uppercase">Total Final:</span>
                <span className="text-2xl font-black text-indigo-600">R$ {printQuotation.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col items-center text-center">
            <div className="w-64 border-t border-slate-300 pt-2">
              <p className="text-[10px] font-black uppercase text-slate-400">Vendedor: {printQuotation.sellerName}</p>
            </div>
            <p className="mt-12 text-[9px] text-slate-300 font-medium">Documento gerado eletronicamente por Pro Catálogo - catologo.pro</p>
          </div>
        </div>
      )}

      {/* Conteúdo Normal da UI */}
      <div className="no-print space-y-6">
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="relative w-full xl:w-1/3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por cliente, vendedor, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full xl:w-auto px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
            >
              <option value="all">Todas as situações</option>
              <option value="waiting">Em espera</option>
              <option value="in_progress">Em execução</option>
              <option value="finished">Finalizada</option>
              <option value="delivered">Entregue</option>
            </select>
          </div>
        </div>

        {/* Tabela Desktop (MD+) */}
        <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-left w-12">
                    <button 
                      onClick={toggleSelectAll}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedIds.length === filteredQuotations.length && filteredQuotations.length > 0
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                        : 'bg-white border-slate-300'
                      }`}
                    >
                      {selectedIds.length === filteredQuotations.length && filteredQuotations.length > 0 && <CheckCircle2 size={14} />}
                    </button>
                  </th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Registro</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Situação</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredQuotations.map(q => {
                  const style = getStatusStyle(q.status);
                  const isSelected = selectedIds.includes(q.id);
                  const qIdStr = String(q.id);
                  return (
                    <tr key={q.id} className={`group hover:bg-slate-50/80 transition-all ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleSelect(q.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200'
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">#{qIdStr.substr(0, 5)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 text-sm">{q.clientName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{q.clientPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon size={14} className="text-indigo-400" />
                          <span className="text-xs font-bold text-slate-600">{q.sellerName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <Calendar size={12} className="text-slate-300" />
                          {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                          {style.icon}
                          {style.label}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-black text-indigo-600 text-sm">
                          R$ {q.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handlePrint(q)}
                            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                            title="Imprimir / PDF"
                          >
                            <Printer size={16} />
                          </button>
                          <button 
                            onClick={() => handleSendWhatsApp(q)}
                            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all shadow-sm"
                            title="Enviar para WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </button>
                          <button 
                            onClick={() => onEdit(q)}
                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => onDelete(q.id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de Orçamentos Mobile (Cards) */}
        <div className="md:hidden space-y-4">
          {filteredQuotations.map(q => {
            const style = getStatusStyle(q.status);
            const isSelected = selectedIds.includes(q.id);
            const qIdStr = String(q.id);
            return (
              <div 
                key={q.id}
                className={`bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm transition-all flex flex-col gap-4 ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => toggleSelect(q.id)}
              >
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                    {style.icon}
                    {style.label}
                  </div>
                  <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    #{qIdStr.substr(0, 5).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 text-base truncate tracking-tight">{q.clientName}</h4>
                    <p className="text-[11px] text-slate-400 font-bold">{q.clientPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-lg font-black text-indigo-600 tracking-tighter">
                      R$ {q.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-1">
                    <UserIcon size={12} className="text-indigo-300" /> {q.sellerName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-300" /> {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSendWhatsApp(q)}
                    className="flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100"
                    title="WhatsApp"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    onClick={() => handlePrint(q)}
                    className="flex items-center justify-center p-3 bg-slate-50 text-slate-600 rounded-2xl"
                    title="Imprimir"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(q)}
                    className="flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(q.id)}
                    className="flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-2xl"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuotations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400">
            <FileText size={48} className="opacity-20 mb-4" />
            <p className="text-xl font-black text-slate-800 uppercase tracking-widest text-center px-4">Nenhum orçamento</p>
            <p className="text-sm font-bold mt-2 text-center px-4">Clique em "Novo Orçamento" para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationList;
