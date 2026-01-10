
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  MessageCircle, 
  MapPin, 
  Mail, 
  Phone,
  LayoutGrid,
  List as ListIcon,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="relative w-full xl:w-1/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center justify-between w-full xl:w-auto gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em Grade"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em Lista"
            >
              <ListIcon size={20} />
            </button>
          </div>
          <button 
            onClick={onAdd}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
          >
            <UserPlus size={18} /> <span className="sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id} 
              onClick={() => onEdit(customer)}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(customer); }} 
                  className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"
                 >
                   <Edit2 size={18}/>
                 </button>
                 <button 
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(customer.id); }} 
                  className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                 >
                   <Trash2 size={18}/>
                 </button>
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center font-black text-2xl shadow-inner uppercase shrink-0">
                  {customer.name[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight truncate">{customer.name}</h4>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {customer.status === 'active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                    {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                  <Mail size={16} className="text-indigo-400 shrink-0" /> <span className="truncate">{customer.email || 'Sem email'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                  <Phone size={16} className="text-indigo-400 shrink-0" /> {customer.phone}
                </div>
                {customer.city && (
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                    <MapPin size={16} className="text-indigo-400 shrink-0" /> {customer.city}, {customer.state}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleWhatsApp(customer.phone); }}
                  className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <FileText size={16} /> Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tabela Responsiva - Oculta em mobile, visível em MD+ */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade/UF</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} onClick={() => onEdit(customer)} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0">
                          {customer.name[0]}
                        </div>
                        <span className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-600">{customer.phone}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600">{customer.city ? `${customer.city}/${customer.state}` : '-'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleWhatsApp(customer.phone); }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><MessageCircle size={18}/></button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(customer); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(customer.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista Mobile - Visível apenas em telas pequenas */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id}
                onClick={() => onEdit(customer)}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm uppercase shrink-0">
                      {customer.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{customer.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${customer.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{customer.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>

                <div className="grid grid-cols-1 gap-2 border-t border-slate-50 pt-3">
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                     <Phone size={14} className="text-indigo-400" /> {customer.phone}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-500 truncate">
                     <Mail size={14} className="text-indigo-400" /> {customer.email || 'Sem email'}
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleWhatsApp(customer.phone); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(customer.id); }}
                    className="p-2.5 bg-red-50 text-red-400 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <UserPlus size={40} />
          </div>
          <p className="text-lg font-black text-slate-800 uppercase tracking-widest">Nenhum cliente</p>
          <p className="text-sm text-slate-400 font-bold mt-2 px-6">Comece cadastrando seu primeiro cliente parceiro.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
