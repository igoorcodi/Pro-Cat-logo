
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  CheckCircle,
  Clock,
  Play,
  PackageCheck,
  Calendar,
  FileText,
  Printer,
  Package,
  CheckCircle2,
  User as UserIcon,
  Building2,
  Mail,
  Phone,
  Info,
  X,
  MessageCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Quotation, QuotationStatus, Company, Customer } from '../types';

interface QuotationListProps {
  quotations: Quotation[];
  company: Company | null;
  customers: Customer[];
  onEdit: (quotation: Quotation) => void;
  onDelete: (id: number | string) => void;
}

const QuotationList: React.FC<QuotationListProps> = ({ quotations, company, customers, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [printQuotation, setPrintQuotation] = useState<Quotation | null>(null);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  const filteredQuotations = useMemo(() => {
    const search = (searchTerm || '').toLowerCase();
    return quotations.filter(q => {
      const qIdStr = String(q.id || '').toLowerCase();
      const clientName = (q.clientName || '').toLowerCase();
      const clientPhone = (q.clientPhone || '').toLowerCase();
      const sellerName = (q.sellerName || '').toLowerCase();
      const keyword = (q.keyword || '').toLowerCase();
      
      const matchesSearch = 
        clientName.includes(search) || 
        clientPhone.includes(search) ||
        sellerName.includes(search) ||
        keyword.includes(search) ||
        qIdStr.includes(search);
        
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
    const itemsList = (quotation.items || []).map(item => {
      const subtotal = ((item.price || 0) * (item.quantity || 0)) - (item.discount || 0);
      return `• *${(item.name || 'Item').toUpperCase()}*\n  ${item.quantity || 0}x R$ ${(item.price || 0).toLocaleString('pt-BR')} ${item.discount > 0 ? `(-R$ ${item.discount.toLocaleString('pt-BR')})` : ''} = R$ ${subtotal.toLocaleString('pt-BR')}`;
    }).join('\n');

    // Added missing 'inactive' status to satisfy Record<QuotationStatus, string>
    const statusMap: Record<QuotationStatus, string> = {
      waiting: 'Em espera',
      in_progress: 'Em execução',
      finished: 'Finalizada',
      delivered: 'Entregue',
      inactive: 'Inativo'
    };

    const message = encodeURIComponent(
      `Olá, *${(quotation.clientName || 'Cliente').toUpperCase()}*!\nAtualização do seu pedido/orçamento:\n\n*Situação:* ${statusMap[quotation.status] || 'Pendente'}\n\n*Itens:*\n${itemsList}\n\n*Total: R$ ${(quotation.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*\n\n${quotation.notes ? `*Observações:* ${quotation.notes}\n\n` : ''}Vendedor: ${quotation.sellerName || 'Vendedor'}\nComo podemos prosseguir? 😊`
    );
    
    const phone = (quotation.clientPhone || '').replace(/\D/g, '');
    if (!phone) return;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const getStatusStyle = (status: QuotationStatus) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <PackageCheck size={14} />, label: 'Entregue' };
      case 'finished': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <CheckCircle size={14} />, label: 'Finalizada' };
      case 'in_progress': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Play size={14} />, label: 'Em execução' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-500', icon: <Clock size={14} />, label: 'Em espera' };
    }
  };

  const getCustomerData = (name: string) => {
    return customers.find(c => (c.name || '').toLowerCase() === name.toLowerCase());
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <style>
        {`
          @media print {
            body { 
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            #root { display: none !important; }
            #print-area-wrapper { 
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
            }
            .no-print { display: none !important; }
            .print-document {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              border-radius: 0 !important;
            }
            .print-bg-slate { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
            .print-bg-indigo { background-color: #4f46e5 !important; -webkit-print-color-adjust: exact; }
            .print-text-white { color: white !important; }
            .print-border-indigo { border-color: #4f46e5 !important; }
          }
        `}
      </style>

      {printQuotation && (
        <div id="print-area-wrapper" className="fixed inset-0 bg-slate-50 z-[9999] overflow-y-auto font-sans text-black no-scrollbar">
          <div className="sticky top-0 left-0 right-0 bg-slate-900 text-white p-3 sm:p-4 flex items-center justify-between shadow-2xl z-[10000] no-print">
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setPrintQuotation(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X size={20} className="sm:size-6" />
              </button>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualizando Orçamento</p>
                {/* Aumento do Código na Barra de Ferramentas */}
                <h4 className="font-black text-base">ID: #{String(printQuotation.id).substring(0, 8).toUpperCase()}</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button 
                onClick={() => handleSendWhatsApp(printQuotation)}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg"
              >
                <MessageCircle size={14} className="sm:size-5" /> <span className="hidden xs:inline">Whats</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-lg"
              >
                <Printer size={14} className="sm:size-5" /> <span className="hidden xs:inline">Imprimir</span>
              </button>
            </div>
          </div>

          <div id="quotation-print-area" className="p-0 sm:px-10 sm:pt-6 sm:pb-20 max-w-5xl mx-auto print:p-0">
            <div className="bg-white min-h-screen sm:min-h-0 sm:rounded-[2.5rem] shadow-xl p-6 sm:p-12 print-document">
                <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-slate-900 pb-6 sm:pb-8 mb-8 sm:mb-10 print-border-indigo gap-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left w-full sm:w-auto">
                    {company?.logo_url ? (
                    <img src={company.logo_url} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-slate-100" alt="Logo Empresa" />
                    ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl print-bg-indigo">
                        <Building2 size={40} />
                    </div>
                    )}
                    <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-slate-900">{company?.trading_name || company?.name || 'Catálogo Pro'}</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{company?.name || ''}</p>
                    <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 leading-tight space-y-0.5">
                        {company?.document && <p>CNPJ/CPF: {company.document}</p>}
                        {company?.address && <p>{company.address}, {company.number} - {company.neighborhood}</p>}
                        {company?.city && <p>{company.city}/{company.state} - {company.zip_code}</p>}
                        <p className="flex justify-center sm:justify-start gap-3 mt-1">
                        {company?.whatsapp && <span className="flex items-center gap-1"><Phone size={10} className="text-indigo-500"/> {company.whatsapp}</span>}
                        {company?.email && <span className="flex items-center gap-1"><Mail size={10} className="text-indigo-500"/> {company.email}</span>}
                        </p>
                    </div>
                    </div>
                </div>
                <div className="text-center sm:text-right flex flex-col justify-between w-full sm:w-auto h-auto sm:h-28">
                    <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-indigo-600 tracking-tight">Orçamento</h2>
                    {/* Aumento Considerável do Código na Impressão */}
                    <p className="text-lg sm:text-3xl font-black text-slate-900 mt-1">Nº {String(printQuotation.id || '').toUpperCase().substr(0, 8)}</p>
                    </div>
                    <div className="text-[9px] sm:text-[11px] font-black uppercase text-slate-400 space-y-0.5 mt-2 sm:mt-0">
                    <p>Emissão: {new Date(printQuotation.createdAt || 0).toLocaleString('pt-BR')}</p>
                    <p>Vendedor: <span className="text-slate-900">{printQuotation.sellerName || 'N/A'}</span></p>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 mb-8 sm:mb-10">
                <div className="col-span-1 sm:col-span-8 bg-slate-50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 print-bg-slate">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-indigo-600">
                    <UserIcon size={14} />
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Dados do Destinatário</p>
                    </div>
                    {(() => {
                    const c = getCustomerData(printQuotation.clientName);
                    return (
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-4">
                        <div className="col-span-1 xs:col-span-2">
                            <p className="text-base sm:text-lg font-black text-slate-800 uppercase">{(printQuotation.clientName || 'Cliente').toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">Documento</p>
                            <p className="text-xs font-bold text-slate-700">{c?.document || 'NÃO INFORMADO'}</p>
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">Contato</p>
                            <p className="text-xs font-bold text-slate-700">{printQuotation.clientPhone || 'NÃO INFORMADO'}</p>
                        </div>
                        <div className="col-span-1 xs:col-span-2 border-t border-slate-200/50 pt-3">
                            <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-1">Endereço de Entrega</p>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                            {c?.address ? `${c.address}, ${c.number || 'S/N'}` : 'NÃO CADASTRADO'}
                            {c?.neighborhood && ` - ${c.neighborhood}`}
                            {c?.city && ` - ${c.city}/${c.state}`}
                            {c?.zipCode && ` (CEP: ${c.zipCode})`}
                            </p>
                        </div>
                        </div>
                    );
                    })()}
                </div>
                
                <div className="col-span-1 sm:col-span-4 bg-slate-900 p-6 rounded-[1.5rem] sm:rounded-[2rem] text-white flex flex-col justify-center items-center text-center print-bg-indigo print-text-white">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 print-text-white">Total Geral</p>
                    <p className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tighter print-text-white">
                    R$ {(printQuotation.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                </div>

                <div className="overflow-x-auto mb-8 sm:mb-10 no-scrollbar rounded-xl sm:rounded-3xl border border-slate-100">
                    <table className="w-full border-collapse min-w-[600px] print:min-w-0">
                    <thead>
                        <tr className="bg-slate-900 text-white print-bg-indigo">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-widest print-text-white">Descrição do Item</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-20 print-text-white">QTD.</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-28 print-text-white">PREÇO UN.</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-4 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-28 print-text-white">DESC.</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-36 print-text-white">SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(printQuotation.items || []).map((item, idx) => {
                        const subtotal = ((item.price || 0) * (item.quantity || 0)) - (item.discount || 0);
                        return (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50 print-bg-slate'}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <p className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{item.name || 'Item'}</p>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-center font-black text-slate-700 text-xs sm:text-sm">{item.quantity || 0}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-slate-500 text-xs sm:text-sm">R$ {(item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-red-400 text-xs sm:text-sm">- R$ {(item.discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-black text-slate-900 text-xs sm:text-sm">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 sm:gap-12 mb-12 sm:mb-16">
                <div className="w-full sm:flex-1">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 mb-2 sm:mb-3 tracking-widest flex items-center gap-2"><Info size={12}/> Observações</p>
                    <div className="p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] min-h-[100px] text-[11px] sm:text-xs leading-relaxed text-slate-600 italic print-bg-slate">
                    {printQuotation.notes || "Sem observações registradas."}
                    </div>
                </div>
                <div className="w-full sm:w-72 space-y-2.5 sm:space-y-3 pt-2">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-xs">
                    <span className="font-black uppercase">Subtotal</span>
                    <span className="font-bold">R$ {(printQuotation.items || []).reduce((a, b) => a + ((b.price || 0) * (b.quantity || 0)), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-400 text-[10px] sm:text-xs">
                    <span className="font-black uppercase">Descontos</span>
                    <span className="font-bold">- R$ {(printQuotation.items || []).reduce((a, b) => a + (b.discount || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t-2 border-slate-900 flex justify-between items-center print-border-indigo">
                    <span className="text-xs sm:text-sm font-black uppercase text-slate-900">Total Final</span>
                    <span className="text-xl sm:text-2xl font-black text-indigo-600">R$ {(printQuotation.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16 px-4 sm:px-10 mt-8 mb-8">
                <div className="flex flex-col items-center">
                    <div className="w-full border-t border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{printQuotation.sellerName || 'VENDEDOR'}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Responsável</p>
                </div>
                
                <div className="flex flex-col items-center">
                    <div className="w-full border-t border-slate-300 mb-2"></div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{(printQuotation.clientName || 'CLIENTE').toUpperCase()}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ciente e Acordo</p>
                </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center text-center opacity-20">
                    <div className="flex items-center gap-2">
                        <Package size={12} />
                        <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.3em]">Documento Digital Pro Catálogo • catalogo.pro</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
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
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Situação</th>
                  <th className="px-4 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredQuotations.map(q => {
                  const style = getStatusStyle(q.status);
                  const isSelected = selectedIds.includes(q.id);
                  const qIdStr = String(q.id || '');
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
                        <span className="font-mono text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase">#{qIdStr.substr(0, 8)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <p className="font-bold text-slate-800 text-sm uppercase">{(q.clientName || 'Cliente')}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{q.clientPhone || ''}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon size={14} className="text-indigo-400" />
                          <span className="text-xs font-bold text-slate-600 uppercase">{q.sellerName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <Calendar size={12} className="text-slate-300" />
                          {new Date(q.createdAt || 0).toLocaleDateString('pt-BR')}
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
                          R$ {(q.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setPrintQuotation(q)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Imprimir"><Printer size={16} /></button>
                          <button onClick={() => handleSendWhatsApp(q)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Enviar"><MessageSquare size={16} /></button>
                          <button onClick={() => onEdit(q)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => onDelete(q.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {filteredQuotations.map(q => {
            const style = getStatusStyle(q.status);
            const isSelected = selectedIds.includes(q.id);
            const qIdStr = String(q.id || '');
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
                  <span className="font-mono text-[11px] font-black text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
                    #{qIdStr.substr(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 text-base truncate tracking-tight uppercase">{(q.clientName || 'Cliente')}</h4>
                    <p className="text-[11px] text-slate-400 font-bold">{q.clientPhone || ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-lg font-black text-indigo-600 tracking-tighter">
                      R$ {(q.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleSendWhatsApp(q)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl active:scale-95"><MessageSquare size={18} /></button>
                  <button onClick={() => setPrintQuotation(q)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl active:scale-95"><Printer size={18} /></button>
                  <button onClick={() => onEdit(q)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl active:scale-95"><Edit2 size={18} /></button>
                  <button onClick={() => onDelete(q.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl active:scale-95"><Trash2 size={18} /></button>
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
